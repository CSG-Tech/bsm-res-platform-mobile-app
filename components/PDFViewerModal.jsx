import React from 'react';
import { Modal, SafeAreaView, StyleSheet, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { X, Share2, Download } from 'lucide-react-native';

const PDFViewerModal = ({ visible, onClose, htmlContent, onShare, loading }) => {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.iconButton}>
            <X size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Preview</Text>
          <TouchableOpacity onPress={onShare} style={styles.iconButton}>
            <Share2 size={24} color="#06193b" />
          </TouchableOpacity>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#06193b" />
            <Text style={styles.loadingText}>Loading preview...</Text>
          </View>
        ) : (
          <WebView
            source={{ html: htmlContent }}
            style={styles.webview}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#06193b" />
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: { fontFamily: 'Inter-Bold', fontSize: 16, color: '#000' },
  iconButton: { padding: 8 },
  webview: { flex: 1 },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 12 
  },
  loadingText: { 
    fontFamily: 'Inter-Regular', 
    fontSize: 14, 
    color: '#666' 
  },
});

export default PDFViewerModal;