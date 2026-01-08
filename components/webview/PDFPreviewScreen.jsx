import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {
  pdfUri: string;
};

export const PdfPreviewScreen = ({ pdfUri }: Props) => {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: pdfUri }}
        style={styles.webview}
        originWhitelist={['*']}
        allowFileAccess
        allowUniversalAccessFromFileURLs
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
