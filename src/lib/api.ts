// API endpoints and utilities for backend integration

// Endpoints Base URL
export const API_BASE_URL = "https://surveyflowai-162119fdccd1.herokuapp.com";

// Endpoints for Stripe
export const STRIPE_ENDPOINTS = {
  // Create subscription session
  CREATE_SUBSCRIPTION: `${API_BASE_URL}/stripe/create-subscription`,
  // Create credits purchase session
  CREATE_CREDITS_PURCHASE: `${API_BASE_URL}/stripe/create-credits-purchase`,
  // Verify session
  VERIFY_SESSION: `${API_BASE_URL}/stripe/verify-session`,
  // Verify email
  VERIFY_EMAIL: `${API_BASE_URL}/stripe/verify-email`,
  // Complete registration
  COMPLETE_REGISTRATION: `${API_BASE_URL}/stripe/complete-registration`,
  // Verify credits purchase
  VERIFY_CREDITS_PURCHASE: `${API_BASE_URL}/stripe/verify-credits-purchase`,
};

// Endpoints for Email
export const EMAIL_ENDPOINTS = {
  // Send email
  SEND_EMAIL: `${API_BASE_URL}/send-email`,
};

// Payment service
export class PaymentService {
  static async createSubscription(
    successUrl: string,
    cancelUrl: string,
    customerEmail?: string,
  ) {
    const response = await fetch(STRIPE_ENDPOINTS.CREATE_SUBSCRIPTION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: customerEmail,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Failed to create subscription session",
      );
    }

    return response.json();
  }

  static async createCreditsSession(
    customerEmail: string,
    quantity: number,
    successUrl: string,
    cancelUrl: string,
  ) {
    const response = await fetch(STRIPE_ENDPOINTS.CREATE_CREDITS_PURCHASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_email: customerEmail,
        quantity,
        success_url: successUrl,
        cancel_url: cancelUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Failed to create credits purchase session",
      );
    }

    return response.json();
  }

  static async verifySession(sessionId: string) {
    const response = await fetch(
      `${STRIPE_ENDPOINTS.VERIFY_SESSION}?session_id=${sessionId}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to verify session");
    }

    return response.json();
  }

  static async verifyEmail(email: string) {
    const response = await fetch(STRIPE_ENDPOINTS.VERIFY_EMAIL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to verify email");
    }

    return response.json();
  }

  static async completeRegistration(email: string) {
    const response = await fetch(STRIPE_ENDPOINTS.COMPLETE_REGISTRATION, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to complete registration");
    }

    return response.json();
  }

  static async verifyCreditsPayment(userId: string, email: string) {
    const response = await fetch(STRIPE_ENDPOINTS.VERIFY_CREDITS_PURCHASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user_id: userId, email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to verify credits payment");
    }

    return response.json();
  }
}

// Email service
export class EmailService {
  static async sendEmail(to: string, subject: string, body: string) {
    const response = await fetch(EMAIL_ENDPOINTS.SEND_EMAIL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        body,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send email");
    }

    return response.json();
  }
}
