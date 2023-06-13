'use client';

import { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Dropdown } from "@nextui-org/react";
import React from 'react';

const variants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};


export default function Setup(){

  return (<></>)

}

function Setup_Old() {

  const [step, setStep] = useState(0);
  const [databaseType, setDatabaseType] = useState("");
  const [email, setEmail] = useState('');
  const [sendgridEmail, setSendgridEmail] = useState('');
  const [loginEmailTemplateId, setLoginEmailTemplateId] = useState('');
  const [sendGridApiKey, setSendGridApiKey] = useState('');
  const router = useRouter();

  const selectedValue = React.useMemo(
    () => Array.from(databaseType).join(", ").replaceAll("_", " "),
    [databaseType]
  );

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (step === 4) {
      console.log(databaseType, email, sendgridEmail, loginEmailTemplateId, sendGridApiKey);
      router.push('/nextPage');
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-3xl font-extrabold text-black mb-8">
            Einrichten: Schritt {step}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 0 && (
              <motion.div
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className='text-black underline'><b>Wilkommen!</b></h2>
                <h3 className='text-black text-base mt-2 mb-2'>Die Einrichtung wird nur ein paar Minuten dauern.</h3>
              </motion.div>
            )}
            {step === 1 && (
              <motion.div
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className='text-black underline'><b>Datenbank</b></h2>
                <h3 className='text-black text-base mt-2 mb-2'>Wähle zuerst den Datenbank-Typ aus</h3>
                <Dropdown>
                  <Dropdown.Button flat color="secondary" css={{ tt: "capitalize" }}>
                    {selectedValue}
                  </Dropdown.Button>
                  <Dropdown.Menu
                    aria-label="Single selection actions"
                    color="secondary"
                    disallowEmptySelection
                    selectionMode="single"
                    selectedKeys={databaseType}
                    onSelectionChange={(e) => setDatabaseType(e)}
                  >
                    <Dropdown.Item key="PostgreSQL">PostgreSQL</Dropdown.Item>
                    <Dropdown.Item key="MySQL">MySQL (noch nicht unterstützt)</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
                
                <h2 className='text-black underline mt-2'><b>Datenbank Daten</b></h2>
                <h3 className='text-black text-base mt-2 mb-2'>Die folgenden Daten sollten für die Datenbank funktionieren.</h3>
                <input
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 focus:z-10 sm:text-sm"
                  type="text"
                  placeholder="Hostadresse (z.B. localhost:3000)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />

              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className='text-black underline'><b>Admin-Email</b></h2>
                <h3 className='text-black text-base mt-2 mb-2'>Diese E-Mail wird für die änderung von Einstellungen etc. verwendet. Stelle sicher, dass du Zugriff auf diese hast.</h3>
                <input
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 focus:z-10 sm:text-sm"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className='text-black underline'><b>SendGrid-Email</b></h2>
                <h3 className='text-black text-base mt-2 mb-2'>Deine E-Mail, die du in SendGrid als Absenderadresse für das versenden von E-Mails eingerichtet hast.</h3>
                <input
                  className="appearance-none mb-2 rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 focus:z-10 sm:text-sm"
                  type="text"
                  placeholder="SendGrid Email"
                  value={sendgridEmail}
                  onChange={e => setSendgridEmail(e.target.value)}
                />

                <h2 className='text-black underline mt-8'><b>SendGrid-API-Token</b></h2>
                <h3 className='text-black text-base mt-2 mb-2'>Deine API-Key, den du in SendGrid eingerichtet hast</h3>
                <input
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 focus:z-10 sm:text-sm"
                  type="text"
                  placeholder="SendGrid API Key"
                  value={sendGridApiKey}
                  onChange={e => setSendGridApiKey(e.target.value)}
                />

                <h2 className='text-black underline mt-8'><b>Login-Template-ID</b></h2>
                <h3 className='text-black text-base mt-2 mb-2'>Die TemplateID des dynamischen E-Mail Templates von SendGrid, welches du für das versenden von LogIn-Codes versendet hat (CODE)</h3>
                <input
                  className="appearance-none mb-2 rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 focus:z-10 sm:text-sm"
                  type="text"
                  placeholder="Login Email Template ID"
                  value={loginEmailTemplateId}
                  onChange={e => setLoginEmailTemplateId(e.target.value)}
                />
              </motion.div>
            )}
            {step === 4 && (
              <motion.div
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <h2 className='text-black underline'><b>Domain</b></h2>
                <h3 className='text-black text-base mt-2 mb-2'>Fast geschafft, jetzt nur noch die Domain für die Website angeben. (Diese wird für die Authentifizierungsdienste benötigt)</h3>
                <input
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-black focus:outline-none focus:ring-indigo-600 focus:border-indigo-600 focus:z-10 sm:text-sm"
                  type="text"
                  placeholder=""
                  value={mongodbUri}
                  onChange={e => setMongodbUri(e.target.value)}
                />
              </motion.div>
            )}
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {step === 3 ? 'Submit' : 'Next'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}