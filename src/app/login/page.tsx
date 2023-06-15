'use client'
import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import React from 'react';
import {redirect, useRouter} from "next/navigation";

const variants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};


export default function Home() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const router = useRouter();

  useEffect(() => {

    const getUser = async () => {

      const response = await fetch("/api/session", {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
      });

      if(response.status==200){
        router.push("/loggedin/dashboard")
      }

    }

    getUser()

  }, [])

  const codeInputRefs = Array.from({ length: 6 }, () => React.createRef<HTMLInputElement>());

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleCodeChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
  
      if (value.length === 1 && index < 5) {
        codeInputRefs[index + 1].current?.focus();
      } else if (value.length === 0 && index > 0) {
        codeInputRefs[index - 1].current?.focus();
      }
    }
  };
  
  const handleSubmitEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Email:', email);
    const bodyContent = JSON.stringify({email: email})
    setShowCodeInput(true);
    const response = await fetch("/api/login", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
      },
      body: bodyContent, // body data type must match "Content-Type" header
    });
  };

  const handleSubmitCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Code:', code);

    const bodyContent = JSON.stringify({email: email, code: code.join('')})

    const response = await fetch("/api/login", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/json",
      },
      body: bodyContent, // body data type must match "Content-Type" header
    });

    if(response.status==200){
      router.push('/loggedin/dashboard');
    }
  };

  const handleGoBack = () => {
    setShowCodeInput(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <motion.div
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {!showCodeInput ? (
              <>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
                  Schritt 1: Gib deine E-Mail ein
                </h2>
                <form onSubmit={handleSubmitEmail} className="space-y-6">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    disabled={showCodeInput}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="vorname.nachname@igs-buchholz.de"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Weiter
                    </button>
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="text-gray-500 hover:text-gray-700 text-sm focus:outline-none"
                    >
                      Zurück
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                  Schritt 2: Gib den Code ein
                </h2>
                <h3 className='text-gray-600 text-xs  mb-4'>Wir haben dir einen Code in dein E-Mail Postfach geschickt, gib diesen bitte hier ein.</h3>
                <motion.form
                  onSubmit={handleSubmitCode}
                  className="space-y-6"
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-center">
                    {code.map((digit, index) => (
                      <div className='ml-4'>
                        <input
                      key={index}
                      ref={codeInputRefs[index]}
                      type="number"
                      required
                      pattern="[0-9]"
                      maxLength={1}
                      value={digit}
                      onChange={(event) => handleCodeChange(index, event)}
                      className="w-12 h-12 text-center text-gray-900 text-2xl border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      </div>
                      
                    ))}
      </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Anmelden
                    </button>
                    <button
                      type="button"
                      onClick={handleGoBack}
                      className="text-gray-500 hover:text-gray-700 text-sm focus:outline-none"
                    >
                      Zurück
                    </button>
                  </div>
                </motion.form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
