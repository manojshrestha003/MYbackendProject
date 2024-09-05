
class ApiError extends Error {
    constructor(
      statusCode,
      message = "Something went wrong",
      errors = [],
      stack = ""
    ) {
      super(message);
      this.statusCode = statusCode;
      this.message = message;
      this.errors = errors;
      this.data = null;
  
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  export { ApiError };
  
// class ApiError extends Error {
//     constructor(
//         statusCode,
//         message = "Something went wrong",
//         errors = [],
//         stack = ""
//     ) {
//         super(message);
        
//         // Set the prototype explicitly for instanceof checks
//         Object.setPrototypeOf(this, ApiError.prototype);

//         this.statusCode = statusCode;
//         this.data = null; // Initialize `data` property
//         this.message = message;
//         this.errors = errors;
//         this.success = false;

//         if (stack) {
//             this.stack = stack;
//         } else {
//             Error.captureStackTrace(this, this.constructor);
//         }
//     }
// }

// export { ApiError };
