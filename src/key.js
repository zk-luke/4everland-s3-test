import 'dotenv/config'; 
import {STSClient, AssumeRoleCommand} from '@aws-sdk/client-sts'
import { S3 } from '@aws-sdk/client-s3';
import { sha256 } from './utils.js';

const { EVER_MASTER_KEY, EVER_MASTER_SECRET,EVER_BUCKET_NAME } = process.env;

// create temp credentials from master key

console.log(EVER_MASTER_KEY, EVER_MASTER_SECRET, EVER_BUCKET_NAME);

const stsClient = new STSClient({
    endpoint: 'https://endpoint.4everland.co',
    region: 'us-west-1',
    credentials: {
        accessKeyId: EVER_MASTER_KEY || '',
        secretAccessKey:  EVER_MASTER_SECRET || '',
    }
});

const params = {
    RoleSessionName: "only-put-object",
    DurationSeconds: 3600,
    Policy: `{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:AbortMultipartUpload"
            ],
            "Resource": [
                "arn:aws:s3:::proofs/*"
            ]
        }
    ]
}`
};

const {Credentials} = await stsClient.send(new AssumeRoleCommand(params));

console.log('Credentials', Credentials);

// upload file
const client = new S3({
  endpoint: 'https://endpoint.4everland.co',
  region: 'us-west-1',
  credentials: {
    accessKeyId: Credentials.AccessKeyId,
    secretAccessKey: Credentials.SecretAccessKey,
    sessionToken: Credentials.SessionToken
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