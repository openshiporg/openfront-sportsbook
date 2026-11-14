import { GraphqlQueryGuardError, validateGraphqlRequestShape } from '../../features/sportsbook/api/graphql-query-guard'
import { createYoga, maskError } from 'graphql-yoga'
import { GraphQLError } from 'graphql'
import type { NextApiRequest, NextApiResponse } from 'next'
import { keystoneContext } from '../../features/keystone/context'
import { runWithTenantScope } from '../../features/keystone/tenant-scope'
import { operatorSessionTenant } from '../../features/keystone'
import { constraintRefusal } from '../../features/keystone/lib/constraint-errors'

// Production keeps Yoga's masking, except a resolver's own refusal code (UPPER_SNAKE, e.g. DUAL_CONTROL_REQUIRED):
// it carries no internals and is what operator forms map to readable copy. Any other message stays masked.
const REFUSAL_CODE=/^[A-Z][A-Z0-9_]{2,63}$/
function operatorCodeOrMasked(error:unknown,message:string,isDev?:boolean){
 const original=error instanceof GraphQLError?error.originalError:error
 const path=error instanceof GraphQLError?error.path:undefined
 if(original instanceof Error&&!(original instanceof GraphQLError)&&REFUSAL_CODE.test(original.message)){
  return new GraphQLError(original.message,{path,extensions:{code:original.message}})
 }
 // A database rule (unique key, money/time CHECK) refused the write: name it instead of "Unexpected error.".
 const rule=constraintRefusal(error)
 if(rule)return new GraphQLError(rule.code,{path,extensions:{code:rule.code,detail:rule.message}})
 // "Not found" is the resolvers' scoped-lookup refusal (missing or another tenant's id); it carries nothing internal.
 if(original instanceof Error&&!(original instanceof GraphQLError)&&original.message==='Not found')return new GraphQLError('NOT_FOUND',{path,extensions:{code:'NOT_FOUND'}})
 return maskError(error,message,isDev)
}

export const config={api:{bodyParser:{sizeLimit:'256kb'}}}
const yoga=createYoga({graphqlEndpoint:'/api/graphql',schema:keystoneContext.graphql.schema,graphiql:false,maskedErrors:process.env.NODE_ENV==='production'?{maskError:operatorCodeOrMasked}:false,context:({req,res}:{req:any;res:any})=>keystoneContext.withRequest(req,res),multipart:false})
export default async function handler(req:NextApiRequest,res:NextApiResponse){
 if(req.method!=='GET'&&req.method!=='POST'){res.setHeader('allow','GET, POST');return res.status(405).json({errors:[{message:'Method not allowed'}]})}
 // Tenant comes only from the signed operator session through the narrow bootstrap read; the whole request (session data, resolvers) then runs in that tenant's scope.
 let tenantId:string|null=null
 try{tenantId=await operatorSessionTenant(req,keystoneContext.prisma)}catch{return res.status(500).json({errors:[{message:'Request unavailable'}]})}
 try{validateGraphqlRequestShape({method:req.method,query:req.method==='GET'?req.query:undefined,body:req.method==='POST'?req.body:undefined})}catch(error){const message=error instanceof GraphqlQueryGuardError&&error.code==='QUERY_EXCEEDS_LIMITS'?'Query exceeds limits':'Invalid query';return res.status(400).json({errors:[{message}]})}
 return runWithTenantScope(tenantId,()=>yoga(req,res))
}
