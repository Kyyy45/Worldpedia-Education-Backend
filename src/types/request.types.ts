/**
 * Course Creation Request
 */
export interface CreateCourseRequest {
  title: string;
  description: string;
  level: 'PAUD' | 'TK' | 'SD' | 'SMP' | 'SMA' | 'UMUM';
  price: number;
  instructorName: string;
  duration: number;
  modules: string[];
  capacity: number;
  thumbnail?: string;
}

/**
 * Update Course Request
 */
export interface UpdateCourseRequest {
  title?: string;
  description?: string;
  level?: 'PAUD' | 'TK' | 'SD' | 'SMP' | 'SMA' | 'UMUM';
  price?: number;
  instructorName?: string;
  duration?: number;
  modules?: string[];
  capacity?: number;
  thumbnail?: string;
  isActive?: boolean;
}

/**
 * Enrollment Request
 */
export interface CreateEnrollmentRequest {
  courseId: string;
}

/**
 * Update Enrollment Status Request
 */
export interface UpdateEnrollmentStatusRequest {
  status: 'active' | 'completed' | 'cancelled';
}

/**
 * Update Enrollment Progress Request
 */
export interface UpdateProgressRequest {
  progress: number;
}

/**
 * Form Field Definition
 */
export interface FormFieldDefinition {
  fieldId: string;
  fieldName: string;
  fieldType: 'text' | 'email' | 'number' | 'date' | 'checkbox' | 'radio' | 'select' | 'textarea';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

/**
 * Create Form Request
 */
export interface CreateFormRequest {
  courseId: string;
  title: string;
  description: string;
  fields: FormFieldDefinition[];
}

/**
 * Update Form Request
 */
export interface UpdateFormRequest {
  title?: string;
  description?: string;
  fields?: FormFieldDefinition[];
  isActive?: boolean;
}

/**
 * Form Submission Request
 */
export interface FormSubmissionRequest {
  responses: Record<string, any>;
}

/**
 * Payment Request
 */
export interface CreatePaymentRequest {
  enrollmentId: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'bank_transfer' | 'e_wallet';
}

/**
 * Update Payment Request (for webhook)
 */
export interface UpdatePaymentRequest {
  transactionId: string;
  status: 'completed' | 'failed';
  paymentMethod?: string;
}

/**
 * Update User Profile Request
 */
export interface UpdateUserProfileRequest {
  fullName?: string;
  avatar?: string;
}

/**
 * Update User Role Request
 */
export interface UpdateUserRoleRequest {
  role: 'student' | 'admin';
}

/**
 * Certificate Batch Request
 */
export interface CreateCertificateBatchRequest {
  courseId: string;
  batchName: string;
  googleDriveFolderId: string;
  certificateCount: number;
}

/**
 * Help Item Request
 */
export interface CreateHelpRequest {
  question: string;
  answer: string;
  category: 'account' | 'course' | 'enrollment' | 'payment' | 'certificate' | 'technical' | 'other';
  keywords?: string[];
}

/**
 * Help Item Update Request
 */
export interface UpdateHelpRequest {
  question?: string;
  answer?: string;
  category?: string;
  keywords?: string[];
  isActive?: boolean;
}

/**
 * Pagination Query
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
}

/**
 * Search Query
 */
export interface SearchQuery {
  q: string;
  page?: number;
  limit?: number;
}

/**
 * Filter Options
 */
export interface FilterOptions {
  level?: string;
  status?: string;
  role?: string;
  isActive?: boolean;
  [key: string]: any;
}