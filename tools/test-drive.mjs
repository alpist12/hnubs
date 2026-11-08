import assert from 'node:assert/strict';
import { generateKeyPairSync } from 'node:crypto';
import { handler } from '../api/drive-files.mjs';
const originalFetch=globalThis.fetch,previous=process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT;
const event={httpMethod:'GET',headers:{},clientIp:'drive-test'};
try {
  delete process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT;
  assert.equal(JSON.parse((await handler(event)).body).reason,'no-service-account');
  assert.equal((await handler({...event,httpMethod:'POST'})).statusCode,405);
  const {privateKey}=generateKeyPairSync('rsa',{modulusLength:2048});
  process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT=JSON.stringify({client_email:'test@example.invalid',private_key:privateKey.export({type:'pkcs8',format:'pem'})});
  let listCount=0;
  globalThis.fetch=async input=>{
    const url=new URL(input);
    if(url.hostname==='oauth2.googleapis.com')return Response.json({access_token:'test-token',expires_in:3600});
    if(url.pathname.endsWith('/1Sb255-QJM--dC_1YGzJax-VlqpWtAxif'))return Response.json({id:'1Sb255-QJM--dC_1YGzJax-VlqpWtAxif',mimeType:'application/vnd.google-apps.folder'});
    assert.equal(url.pathname,'/drive/v3/files');
    assert.match(url.searchParams.get('q'),/trashed = false/);
    assert.equal(url.searchParams.get('supportsAllDrives'),'true');
    listCount++;
    return Response.json({files:[{id:'clip',name:'clip.mp4',mimeType:'video/mp4',parents:['1Sb255-QJM--dC_1YGzJax-VlqpWtAxif']}]});
  };
  const result=JSON.parse((await handler(event)).body);
  assert.equal(result.mode,'google');assert.equal(result.items[0].parent,'root');assert.equal(listCount,1);
  globalThis.fetch=async()=>new Response('',{status:403});
  assert.equal(JSON.parse((await handler(event)).body).reason,'not-shared');
  console.log('Drive configuration, root access and non-trashed folder listing passed.');
} finally {
  globalThis.fetch=originalFetch;
  if(previous===undefined)delete process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT;else process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT=previous;
}
