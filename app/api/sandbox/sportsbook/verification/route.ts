import { keystoneContext } from '@/features/keystone/context'
import { authenticateCustomerRequest } from '@/features/sportsbook/customer/auth'
import { assertCustomerMutationRequest, errorResponse, readJsonObject } from '@/features/sportsbook/customer/errors'
import { submitCustomerVerification } from '@/features/sportsbook/customer/verification'
export async function POST(request:Request){try{assertCustomerMutationRequest(request);const actor=await authenticateCustomerRequest(keystoneContext.prisma,request),body=await readJsonObject(request);return Response.json(await submitCustomerVerification(keystoneContext.prisma,actor,{legalName:body.legalName,dateOfBirth:body.dateOfBirth,countryCode:body.countryCode,postalCode:body.postalCode,idempotencyKey:body.idempotencyKey}),{status:201})}catch(error){return errorResponse(error)}}
