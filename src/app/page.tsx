'use client'
import React from 'react'
import Head from 'next/head'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer';
import { redirect, useRouter } from 'next/navigation';
import { Carousel } from 'react-responsive-carousel'
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import Image from 'next/image';

const Home: React.FC = () => {
    
  const router = useRouter()

  return (
  <div className="min-h-screen bg-gray-100 text-black flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <Head>
      <title>Schul-3D-Druck</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between py-6">
        <div>
          <img className="h-8 w-auto sm:h-10" src="/school-logo.svg" alt="" />
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
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              type="button"
              onClick={() => {router.push('/login')}}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-black bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Loslegen
            </motion.button>

          </div>
          
        </div>
      </main>

      <div className="max-w-full mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-blue-600 text-center mb-8"
        >
          Entdeckt die Möglcihkeiten der Unterschiedlichen Sprachen
        </motion.h2>

        <div className="grid grid-cols-1 gap-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between min-h-screen"
            >
              <div className="w-1/2">
                <h3 className="text-blue-600 font-bold text-2xl">Latein</h3>
                <p className="mt-4">Die Lateinische Sprache ist zwar schon die ein oder anderen Jahre auf dem Buckel hat aber Trotzdem noch nicht ihren Scham verloren alles im allem eine Serh Herrisch klingende und manchmal auch nutzvolle Sprache.</p>
              </div>
              <div className="w-1/2 relative">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className='blur-xl'>
                <path fill="#9EF0F0" d="M37.9,-60.5C47.9,-59.8,54.1,-47.3,55.8,-35.2C57.4,-23.2,54.6,-11.6,53.5,-0.7C52.3,10.3,52.8,20.5,48.7,28.3C44.6,36.1,35.8,41.4,26.9,51.8C18,62.2,9,77.7,-0.7,78.9C-10.4,80.1,-20.8,67.1,-33.9,59.1C-46.9,51.1,-62.5,48.1,-68.4,39.1C-74.3,30.1,-70.6,15,-64.7,3.4C-58.9,-8.3,-51,-16.6,-45.9,-27.1C-40.8,-37.6,-38.6,-50.3,-31.4,-52.6C-24.2,-55,-12.1,-47.1,0.9,-48.7C13.9,-50.2,27.8,-61.2,37.9,-60.5Z" transform="translate(100 100)" />
              </svg>
                <Image src="/spqr.svg" width={60} height={30} alt="/" className="relative h-24 w-auto mx-auto"></Image>
              </div>
            </motion.div>


            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between min-h-screen flex-row-reverse"
            >
              <div className="w-1/2">
                <h3 className="text-blue-600 font-bold text-2xl">Spanisch</h3>
                <p className="mt-4">Die Spanische Sprache ist Mittlerweile weit verbreitet und wird auch an dieser Schule Unterrichtet Generell ist Spanisch eine wunderschöne Sprache die unter anderem auch als sehr atraktiv empfunden wird. </p>
              </div>
              <div className="w-1/2 relative">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className='blur-xl'>
                  <path fill="#A7F0BA" d="M23.7,-45.3C32.2,-36,41.8,-32.9,52.3,-26.3C62.8,-19.8,74.3,-9.9,73.2,-0.6C72.1,8.7,58.6,17.3,47.7,23.2C36.7,29,28.5,32,21,43.4C13.5,54.8,6.7,74.6,-4.1,81.8C-15,88.9,-30.1,83.5,-43.6,75.6C-57.1,67.7,-69.2,57.3,-71,44.3C-72.8,31.3,-64.4,15.6,-57.3,4.1C-50.1,-7.4,-44.2,-14.8,-43.1,-28.9C-41.9,-43.1,-45.5,-64.1,-39.1,-74.6C-32.8,-85.1,-16.4,-85.1,-4.4,-77.5C7.5,-69.9,15.1,-54.5,23.7,-45.3Z" transform="translate(100 100)" />
                </svg>
                <img src="/spain.svg" alt="" className="relative h-24 w-auto mx-auto" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between min-h-screen"
            >
              <div className="w-1/2">
                <h3 className="text-blue-600 font-bold text-2xl">Französisch</h3>
                <p className="mt-4">Französisch auch eine der Sprachen die hier angeboten werden viele sagen sie klingt romantisch andere sagen das fack macht nicht so viel Spaß aber das ist jedem für sich überlassen.</p>
              </div>
              <div className="w-1/2 relative">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className='blur-xl'>
                    <path fill="#FFD6E8" d="M43.6,-71C56.2,-68.2,66,-56,68.8,-42.6C71.5,-29.2,67.2,-14.6,67.8,0.4C68.5,15.3,74.1,30.7,69.9,41.6C65.7,52.5,51.7,58.9,38.5,66.8C25.2,74.6,12.6,83.8,2.7,79.1C-7.1,74.4,-14.3,55.7,-23.4,45.5C-32.6,35.3,-43.8,33.5,-50.7,27.3C-57.6,21.2,-60.3,10.6,-62.5,-1.2C-64.6,-13.1,-66.3,-26.2,-61.3,-35.7C-56.3,-45.2,-44.6,-51.1,-33.3,-54.6C-21.9,-58.2,-11,-59.3,2.3,-63.2C15.5,-67.1,31,-73.8,43.6,-71Z" transform="translate(100 100)" />
                </svg>
                <img src="/france.svg" alt="" className="relative h-24 w-auto mx-auto" />
              </div>
            </motion.div>
        </div>
      </div>
    </div>
  </div>
)}

export default Home