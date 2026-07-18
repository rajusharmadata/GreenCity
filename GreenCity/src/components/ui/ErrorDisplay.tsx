import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../styles/theme';
import { AppError, getUserFriendlyMessage, getErrorSeverity, isRecoverableError } from '../../utils/errorHandler';
import { errorDisplayStyles as styles } from './errorDisplayStyles';

interface ErrorDisplayProps {
  error: AppError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
}) => {
  const severity = getErrorSeverity(error);
  const recoverable = isRecoverableError(error);
  const message = getUserFriendlyMessage(error);

  const severityColors = {
    low: Colors.warning,
    medium: Colors.info,
    high: Colors.error,
  };

  const severityIcons = {
    low: 'warning-outline',
    medium: 'information-circle-outline',
    high: 'alert-circle-outline',
  };

  return (
    <View style={[styles.container, { borderLeftColor: severityColors[severity] }]}>
      <View style={styles.header}>
        <Ionicons
          name={severityIcons[severity] as any}
          size={24}
          color={severityColors[severity]}
        />
        <View style={styles.headerText}>
          <Text style={styles.title}>Error</Text>
          {error.code && (
            <Text style={styles.code}>{error.code}</Text>
          )}
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={20} color={Colors.neutral[400]} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.message}>{message}</Text>

      {showDetails && error.details && (
        <View style={styles.details}>
          <Text style={styles.detailsTitle}>Details:</Text>
          <Text style={styles.detailsText}>
            {typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2)}
          </Text>
        </View>
      )}

      {(onRetry || recoverable) && (
        <View style={styles.actions}>
          {onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <Ionicons name="refresh-outline" size={18} color={Colors.primary[500]} />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
          {recoverable && !onRetry && (
            <Text style={styles.hint}>This error might be temporary. Please try again.</Text>
          )}
        </View>
      )}
    </View>
  );
};

interface InlineErrorProps {
  error: string;
  visible: boolean;
}

export const InlineError: React.FC<InlineErrorProps> = ({ error, visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.inlineContainer}>
      <Ionicons name="alert-circle" size={16} color={Colors.error} />
      <Text style={styles.inlineText}>{error}</Text>
    </View>
  );
};

interface ErrorCardProps {
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  action?: React.ReactNode;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  title,
  message,
  icon = 'alert-circle-outline',
  action,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={32} color={Colors.error} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardMessage}>{message}</Text>
      {action && <View style={styles.cardAction}>{action}</View>}
    </View>
  );
};
