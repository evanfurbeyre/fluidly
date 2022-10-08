import type { NextPage } from "next"
import Head from "next/head"
import Input from "../components/Input"

const Correction: NextPage = () => {
  return (
    <>
      <Head>
        <title>Speaking Correction</title>
        <meta name="description" content="language learning tool" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex justify-center p-6">
        <Input id="test3" />
      </div>
    </>
  )
}

export default Correction
