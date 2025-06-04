import 'dotenv/config'; 

import { S3,S3Client } from '@aws-sdk/client-s3';
import { sha256 } from './utils.js';

const { EVER_API_KEY, EVER_API_SECRET,EVER_BUCKET_NAME,EVER_SESSION } = process.env;

const client = new S3({
  endpoint: 'https://endpoint.4everland.co',
  region: 'eu-west-2',
  credentials: {
    accessKeyId: EVER_API_KEY || '',
    secretAccessKey: EVER_API_SECRET || '',
    sessionToken: EVER_SESSION || '',
  }
});

export async function set(data) {
  const payload = data instanceof Buffer ? data : JSON.stringify(data);
  const params = {
    Bucket: EVER_BUCKET_NAME,
    Key: `proofs/${sha256(payload)}`
  };
  await client.putObject({
    ...params,
    Body: payload,
    ContentType: data instanceof Buffer ? undefined : 'application/json; charset=utf-8'
  });
  const result = await client.headObject(params);
  const cid = JSON.parse(result.ETag || 'null');

  return { cid };
}

const res = await set({age:18,name:"json"});
console.log('res', res);