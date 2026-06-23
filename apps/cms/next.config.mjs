import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@mccartney/db', '@mccartney/search'],
}

export default withPayload(nextConfig)
