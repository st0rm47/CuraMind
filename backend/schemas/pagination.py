# This file contains the schemas for pagination-related data structures
# These schemas are used for validating and serializing data in API requests and responses.

from pydantic import BaseModel, Field

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1)                      # Page number for pagination (default: 1)
    limit: int = Field(10, ge=1, le=100)           # Number of items per page for pagination (default: 10, max: 100)
    
    @property
    def offset(self) -> int:
        """Calculate and return the offset for database queries based on the current page and limit."""
        return (self.page - 1) * self.limit
    

class PaginatedResponse(BaseModel):
    items: list                                  # List of items for the current page
    total: int                                  # Total number of items across all pages    
    page: int                                   # Current page number
    limit: int                                  # Number of items per page
    pages: int                                 # Total number of pages calculated based on total and limit
    