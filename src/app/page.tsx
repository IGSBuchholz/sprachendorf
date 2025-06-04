'use client'
import React, {useEffect} from 'react'
import Head from 'next/head'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer';
import { redirect, useRouter } from 'next/navigation';
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import Image from 'next/image';
import Link from "next/link";
import {Button} from "@nextui-org/react";
import {getSession, signIn} from "next-auth/react";

const Home: React.FC = () => {


  const router = useRouter()

  return (
  <div className="min-h-screen bg-gray-100 text-black flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <Head>
      <title>Schul-3D-Druck</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="flex items-center justify-center">
        <div className="flex justify-center">
          <img
              className="w-auto h-48"
              src="/school-logo.svg"
              alt=""
              style={{ maxWidth: '100%' }}
          />
        </div>
      </header>

      <main className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24 sm:px-6 md:mt-32 lg:px-8">
        <div className="text-center">
          
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-blue-600 font-semibold tracking-wide uppercase"
          >
            Willkommen beim Sprachendorf
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            Bringt Kultur in euer Leben
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-2 text-base"
          >
            
          </motion.p>

          <div className="mt-8 flex justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-black bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Link href={'/login'}>Loslegen</Link>
            </motion.div>
            <Button onClick={() => {signIn()}}>Loslegen (next-auth)</Button>

          </div>
          
        </div>
      </main>

    </div>
  </div>
)}

export default Home