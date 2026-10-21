import { GraphqlQueryGuardError, validateGraphqlRequestShape } from '../../features/sportsbook/api/graphql-query-guard'
import { createYoga } from 'graphql-yoga'
import type { NextApiRequest, NextApiResponse } from 'next'
import { keystoneContext } from '../../features/keystone/context'
import { runWithTenantScope } from '../../features/keystone/tenant-scope'
import { operatorSessionTenant } from '../../features/keystone'

export const config={api:{bodyParser:{sizeLimit:'256kb'}}}
const yoga=createYoga({graphqlEndpoint:'/api/graphql',schema:keystoneContext.graphql.schema,graphiql:process.env.NODE_ENV!=='production',maskedErrors:process.env.NODE_ENV==='production',context:({req,res}:{req:any;res:any})=>keystoneContext.withRequest(req,res),multipart:false})
export default async function handler(req:NextApiRequest,res:NextApiResponse){
 if(req.method!=='GET'&&req.method!=='POST'){res.setHeader('allow','GET, POST');return res.status(405).json({errors:[{message:'Method not allowed'}]})}
 // Tenant comes only from the signed operator session through the narrow bootstrap read; the whole request (session data, resolvers) then runs in that tenant's scope.
 let tenantId:string|null=null
 try{tenantId=await operatorSessionTenant(req,keystoneContext.prisma)}catch{return res.status(500).json({errors:[{message:'Request unavailable'}]})}
 try{validateGraphqlRequestShape({method:req.method,query:req.method==='GET'?req.query:undefined,body:req.method==='POST'?req.body:undefined})}catch(error){const message=error instanceof GraphqlQueryGuardError&&error.code==='QUERY_EXCEEDS_LIMITS'?'Query exceeds limits':'Invalid query';return res.status(400).json({errors:[{message}]})}
 return runWithTenantScope(tenantId,()=>yoga(req,res))
}
