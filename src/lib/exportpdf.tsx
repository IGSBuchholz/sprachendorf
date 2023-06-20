//@ts-ignore
//@ts-nocheck
import { Document, Page, View, Image, Text, StyleSheet, PDFDownloadLink, Canvas } from '@react-pdf/renderer';

export const ExportButton = ({coursesDone, usersname}) => (
    <PDFDownloadLink className="rounded-xl bg-blue-500 px-6 py-2 mx-auto flex justify-center mb-4" document={<PdfDocument coursesDone={coursesDone} usersname={usersname} />} fileName={usersname.split(' ')[0] + "_" + usersname.split(' ')[1] + "_courses.pdf"}>
        {({ blob, url, loading, error }) =>
            loading ? 'PDF wird erstellt...' : 'Als PDF herunterladen'
        }
    </PDFDownloadLink>
);

const PdfDocument = ({coursesDone, usersname}) => {
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
        border: '1pt solid #ddd',
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
        border: '1pt solid #ddd',
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
        border: '1pt solid #ddd',
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
                            <Text style={styles.heading}>{usersname}</Text>
                                <View key={"ind"} style={styles.userCard}>
                                    {coursesDone.map((cc, indexcc) => (
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
