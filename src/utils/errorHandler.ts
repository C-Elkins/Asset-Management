/**
 * Comprehensive error handling utility for user-friendly error messages
 */

export interface ErrorInfo {
  title: string;
  message: string;
  userAction?: string;
}

/**
 * Parse database and API errors into user-friendly messages
 */
export function parseError(error: any, context?: string): ErrorInfo {
  const errorMessage = error?.message || String(error);
  const errorCode = error?.code;

  // UNIQUE constraint violations
  if (errorMessage.includes('UNIQUE constraint failed: assets.asset_tag')) {
    return {
      title: 'Duplicate Asset Tag',
      message: 'This asset tag already exists in the system.',
      userAction: 'Please choose a different asset tag. Asset tags must be unique.'
    };
  }

  if (errorMessage.includes('UNIQUE constraint failed: assets.serial_number')) {
    return {
      title: 'Duplicate Serial Number',
      message: 'This serial number is already registered to another asset.',
      userAction: 'Please verify the serial number or use a different one.'
    };
  }

  if (errorMessage.includes('UNIQUE constraint failed: categories.name')) {
    return {
      title: 'Duplicate Category Name',
      message: 'A category with this name already exists.',
      userAction: 'Please choose a different category name.'
    };
  }

  if (errorMessage.includes('UNIQUE constraint failed: users.username')) {
    return {
      title: 'Username Already Taken',
      message: 'This username is already in use.',
      userAction: 'Please choose a different username.'
    };
  }

  if (errorMessage.includes('UNIQUE constraint failed: users.email')) {
    return {
      title: 'Email Already Registered',
      message: 'This email address is already registered.',
      userAction: 'Please use a different email address or login with this email.'
    };
  }

  if (errorMessage.includes('UNIQUE constraint failed')) {
    return {
      title: 'Duplicate Entry',
      message: 'This record already exists in the system.',
      userAction: 'Please check your inputs and ensure all values are unique.'
    };
  }

  // NOT NULL constraint violations
  if (errorMessage.includes('NOT NULL constraint failed: assets.asset_tag')) {
    return {
      title: 'Asset Tag Required',
      message: 'Asset tag is a required field.',
      userAction: 'Please provide an asset tag before saving.'
    };
  }

  if (errorMessage.includes('NOT NULL constraint failed: assets.name')) {
    return {
      title: 'Asset Name Required',
      message: 'Asset name is a required field.',
      userAction: 'Please provide an asset name before saving.'
    };
  }

  if (errorMessage.includes('NOT NULL constraint failed')) {
    return {
      title: 'Missing Required Field',
      message: 'One or more required fields are missing.',
      userAction: 'Please fill in all required fields (marked with *) before saving.'
    };
  }

  // Foreign key constraint violations
  if (errorMessage.includes('FOREIGN KEY constraint failed')) {
    if (context === 'delete-category') {
      return {
        title: 'Cannot Delete Category',
        message: 'This category is currently in use and cannot be deleted.',
        userAction: 'Please move or delete all assets in this category first.'
      };
    }
    if (context === 'delete-user') {
      return {
        title: 'Cannot Delete User',
        message: 'This user has associated records and cannot be deleted.',
        userAction: 'Please reassign or remove associated records first.'
      };
    }
    return {
      title: 'Cannot Delete Record',
      message: 'This record is currently in use by other parts of the system.',
      userAction: 'Please remove all dependencies before deleting.'
    };
  }

  // Check constraint violations
  if (errorMessage.includes('CHECK constraint failed')) {
    return {
      title: 'Invalid Data',
      message: 'The data provided does not meet the required format or constraints.',
      userAction: 'Please check your inputs and ensure all values are valid.'
    };
  }

  // Authentication errors
  if (errorMessage.includes('Invalid credentials') || errorMessage.includes('Incorrect password')) {
    return {
      title: 'Login Failed',
      message: 'The username or password you entered is incorrect.',
      userAction: 'Please check your credentials and try again.'
    };
  }

  if (errorMessage.includes('Unauthorized') || errorCode === 'UNAUTHORIZED') {
    return {
      title: 'Access Denied',
      message: 'You do not have permission to perform this action.',
      userAction: 'Please contact your administrator if you believe this is an error.'
    };
  }

  // File upload errors
  if (errorMessage.includes('File too large') || errorMessage.includes('LIMIT_FILE_SIZE')) {
    return {
      title: 'File Too Large',
      message: 'The file you are trying to upload exceeds the maximum size limit.',
      userAction: 'Please choose a smaller file (max 10MB) and try again.'
    };
  }

  if (errorMessage.includes('Invalid file type') || errorMessage.includes('LIMIT_UNEXPECTED_FILE')) {
    return {
      title: 'Invalid File Type',
      message: 'The file type you selected is not supported.',
      userAction: 'Please upload a supported file type (PDF, PNG, JPG, XLSX, DOCX).'
    };
  }

  // Network errors
  if (errorMessage.includes('Network error') || errorMessage.includes('Failed to fetch')) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server.',
      userAction: 'Please check your internet connection and try again.'
    };
  }

  if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
    return {
      title: 'Request Timeout',
      message: 'The request took too long to complete.',
      userAction: 'Please try again. If the problem persists, contact support.'
    };
  }

  // Validation errors
  if (errorMessage.includes('Invalid email')) {
    return {
      title: 'Invalid Email Address',
      message: 'The email address format is invalid.',
      userAction: 'Please enter a valid email address (e.g., user@example.com).'
    };
  }

  if (errorMessage.includes('Password too weak')) {
    return {
      title: 'Weak Password',
      message: 'The password does not meet security requirements.',
      userAction: 'Password must be at least 8 characters with uppercase, lowercase, and numbers.'
    };
  }

  // Reservation/Checkout errors
  if (errorMessage.includes('Asset is already checked out')) {
    return {
      title: 'Asset Unavailable',
      message: 'This asset is currently checked out to another user.',
      userAction: 'Please choose a different asset or wait until it is returned.'
    };
  }

  if (errorMessage.includes('Conflicting reservation')) {
    return {
      title: 'Reservation Conflict',
      message: 'This asset is already reserved for the selected time period.',
      userAction: 'Please choose a different time period or asset.'
    };
  }

  // Default error with context
  if (context) {
    return {
      title: `${context} Failed`,
      message: errorMessage,
      userAction: 'Please check your inputs and try again. If the problem persists, contact support.'
    };
  }

  // Generic fallback
  return {
    title: 'Operation Failed',
    message: errorMessage || 'An unexpected error occurred.',
    userAction: 'Please try again. If the problem persists, contact support.'
  };
}

/**
 * Show user-friendly error alert
 */
export function showError(error: any, context?: string): void {
  const errorInfo = parseError(error, context);

  let message = `❌ ${errorInfo.title}\n\n${errorInfo.message}`;
  if (errorInfo.userAction) {
    message += `\n\n💡 ${errorInfo.userAction}`;
  }

  alert(message);
}

/**
 * Common error contexts for better messages
 */
export const ErrorContext = {
  SAVE_ASSET: 'Save Asset',
  DELETE_ASSET: 'Delete Asset',
  UPDATE_ASSET: 'Update Asset',
  SAVE_CATEGORY: 'Save Category',
  DELETE_CATEGORY: 'Delete Category',
  SAVE_USER: 'Save User',
  DELETE_USER: 'Delete User',
  SAVE_RESERVATION: 'Save Reservation',
  CANCEL_RESERVATION: 'Cancel Reservation',
  CHECKOUT_ASSET: 'Checkout Asset',
  CHECKIN_ASSET: 'Check-in Asset',
  UPLOAD_FILE: 'Upload File',
  SAVE_SETTINGS: 'Save Settings',
  IMPORT_DATA: 'Import Data',
  EXPORT_DATA: 'Export Data',
} as const;
