/**
 * Cloud Feedback Submission Service
 * Sends feedback to external services for test user collection
 */

import { logger } from './logger';
import type { FeedbackEntry, UsageAnalytics } from './feedback';

interface SubmissionConfig {
  webhookUrl?: string;
  emailService?: 'formspree' | 'netlify' | 'custom';
  emailEndpoint?: string;
  enabled: boolean;
}

class FeedbackSubmissionService {
  private config: SubmissionConfig = {
    enabled: false, // Disabled by default
  };

  configure(config: Partial<SubmissionConfig>) {
    this.config = { ...this.config, ...config };
    logger.info('Feedback submission configured', { enabled: this.config.enabled });
  }

  async submitFeedback(feedback: FeedbackEntry): Promise<boolean> {
    if (!this.config.enabled) {
      logger.debug('Feedback submission disabled, storing locally only');
      return true; // Still return success for local storage
    }

    try {
      // Try webhook first
      if (this.config.webhookUrl) {
        const success = await this.submitToWebhook(feedback);
        if (success) return true;
      }

      // Try email service as fallback
      if (this.config.emailEndpoint) {
        const success = await this.submitToEmail(feedback);
        if (success) return true;
      }

      logger.warn('No submission method configured or all failed');
      return false;
    } catch (error) {
      logger.error('Failed to submit feedback to cloud', error);
      return false;
    }
  }

  async submitAnalytics(analytics: UsageAnalytics): Promise<boolean> {
    if (!this.config.enabled) {
      return true;
    }

    try {
      if (this.config.webhookUrl) {
        return await this.submitAnalyticsToWebhook(analytics);
      }
      return false;
    } catch (error) {
      logger.error('Failed to submit analytics to cloud', error);
      return false;
    }
  }

  private async submitToWebhook(feedback: FeedbackEntry): Promise<boolean> {
    try {
      const response = await fetch(this.config.webhookUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'feedback',
          data: feedback,
          timestamp: new Date().toISOString(),
          source: 'homekeeper_app',
        }),
      });

      if (response.ok) {
        logger.info('Feedback submitted to webhook successfully', { feedbackId: feedback.id });
        return true;
      } else {
        logger.warn('Webhook submission failed', { status: response.status });
        return false;
      }
    } catch (error) {
      logger.error('Webhook submission error', error);
      return false;
    }
  }

  private async submitToEmail(feedback: FeedbackEntry): Promise<boolean> {
    try {
      const emailBody = this.formatFeedbackForEmail(feedback);
      
      const response = await fetch(this.config.emailEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: `HomeKeeper Feedback: ${feedback.type.toUpperCase()} - ${feedback.title}`,
          message: emailBody,
          _replyto: 'noreply@homekeeper.app',
        }),
      });

      if (response.ok) {
        logger.info('Feedback submitted via email successfully', { feedbackId: feedback.id });
        return true;
      } else {
        logger.warn('Email submission failed', { status: response.status });
        return false;
      }
    } catch (error) {
      logger.error('Email submission error', error);
      return false;
    }
  }

  private async submitAnalyticsToWebhook(analytics: UsageAnalytics): Promise<boolean> {
    try {
      const response = await fetch(this.config.webhookUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'analytics',
          data: analytics,
          timestamp: new Date().toISOString(),
          source: 'homekeeper_app',
        }),
      });

      return response.ok;
    } catch (error) {
      logger.error('Analytics webhook submission error', error);
      return false;
    }
  }

  private formatFeedbackForEmail(feedback: FeedbackEntry): string {
    return `
HomeKeeper User Feedback

Type: ${feedback.type.toUpperCase()}
Title: ${feedback.title}
Description: ${feedback.description}
${feedback.rating ? `Rating: ${feedback.rating}/5 stars` : ''}

User Context:
${feedback.userContext ? `
- Screen: ${feedback.userContext.screen || 'Unknown'}
- Action: ${feedback.userContext.action || 'N/A'}
- Timestamp: ${feedback.userContext.timestamp}
` : 'No context provided'}

Feedback ID: ${feedback.id}
Submitted: ${feedback.timestamp}

---
Sent from HomeKeeper App
    `.trim();
  }

  // Helper method to get submission status
  getStatus(): { enabled: boolean; methods: string[] } {
    const methods = [];
    if (this.config.webhookUrl) methods.push('webhook');
    if (this.config.emailEndpoint) methods.push('email');
    
    return {
      enabled: this.config.enabled,
      methods,
    };
  }
}

// Export singleton
export const feedbackSubmissionService = new FeedbackSubmissionService();

// Easy setup functions for different services
export const setupFeedbackCollection = {
  // Option 1: Formspree (free email service)
  formspree: (formId: string) => {
    feedbackSubmissionService.configure({
      enabled: true,
      emailService: 'formspree',
      emailEndpoint: `https://formspree.io/f/${formId}`,
    });
  },

  // Option 2: Webhook (Zapier, Make.com, or custom)
  webhook: (webhookUrl: string) => {
    feedbackSubmissionService.configure({
      enabled: true,
      webhookUrl,
    });
  },

  // Option 3: Netlify Forms
  netlify: (endpoint: string) => {
    feedbackSubmissionService.configure({
      enabled: true,
      emailService: 'netlify',
      emailEndpoint: endpoint,
    });
  },

  // Option 4: Custom endpoint
  custom: (config: Partial<SubmissionConfig>) => {
    feedbackSubmissionService.configure({
      enabled: true,
      ...config,
    });
  },

  // Disable cloud submission (local only)
  disable: () => {
    feedbackSubmissionService.configure({
      enabled: false,
    });
  },
}; 