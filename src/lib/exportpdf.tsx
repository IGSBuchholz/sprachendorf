'use client'
//@ts-ignore
//@ts-nocheck
import { Document, Page, View, Image, Text, StyleSheet, Canvas, PDFDownloadLink } from '@react-pdf/renderer';

import dynamic from 'next/dynamic';

// ...

// @ts-ignore
export const ExportButton = ({coursesDone, usersname}) => {
  const fileName = usersname
    ? `${usersname.split(' ')[0]}_${usersname.split(' ')[1] || ''}_courses.pdf`
    : 'courses.pdf';
  // @ts-ignore
    return (
    <PDFDownloadLink
      className="rounded-xl bg-blue-500 px-6 py-2 mx-auto flex justify-center mb-4 cursor-pointer"
      document={<PdfDocument coursesDone={coursesDone} usersname={usersname} />}
      fileName={fileName}
    >
        {/* @ts-ignore */}
      {({ blob, url, loading, error }) =>
        loading ? 'PDF wird erstellt...' : 'Als PDF herunterladen'
      }
    </PDFDownloadLink>
  );
};
{/* @ts-ignore */}
const PdfDocument = ({coursesDone, usersname}) => {
  const displayName = usersname || '';
  const items = Array.isArray(coursesDone) ? coursesDone : [];

  // Define a new color for use in the stylesheet
  const blueAccent = '#007BFF';

  // Updated styles
  const styles = StyleSheet.create({
      page: {
          backgroundColor: 'white',
      },
      container: {
          flex: 1,
          flexDirection: 'column',
          padding: 30,
      },
      card: {
          marginBottom: 15,
          padding: 10,
          borderWidth: 1,
          borderColor: '#ddd',
          borderStyle: 'solid',
          borderRadius: 5,
      },
      heading: {
          fontSize: 24,
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: 10,
          color: blueAccent,
      },
      userCard: {
          marginVertical: 10,
          padding: 10,
          borderWidth: 1,
          borderColor: '#ddd',
          borderStyle: 'solid',
          borderRadius: 5,
      },
      userTitle: {
          fontWeight: 'bold',
          fontSize: 18,
          marginBottom: 5,
      },
      userEmail: {
          fontSize: 16,
          color: '#888',
          marginBottom: 10,
      },
      completionCard: {
          marginVertical: 5,
          padding: 10,
          borderWidth: 1,
          borderColor: '#ddd',
          borderStyle: 'solid',
          borderRadius: 5,
      },
      completionTitle: {
          fontWeight: 'bold',
          fontSize: 16,
          marginBottom: 5,
      },
      completionInfo: {
          fontSize: 14,
          color: '#888',
      },
  });


      return (
              <Document>
                  <Page size="A4" style={styles.page}>
                      <View style={styles.container}>
                          <View style={styles.card}>
                              <Text style={styles.heading}>{displayName}</Text>
                                  <View key={"ind"} style={styles.userCard}>
                                      {items.map((cc, indexcc) => (
                                          <View key={"completion" + indexcc + ":" + indexcc} style={styles.completionCard}>
                                              <Text style={styles.completionTitle}>{cc.country}</Text>
                                              <Text style={styles.completionInfo}>
                                                  Station: {cc.level}, Niveau: {cc.niveau}/3
                                              </Text>
                                          </View>
                                      ))}
                                  </View>
                          </View>
                      </View>
                  </Page>
              </Document>
      );
  };
        {/* @ts-ignore */}