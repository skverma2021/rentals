import { prisma } from "@/lib/prisma";

/**
 * Check if a rental period overlaps with any existing rentals for an asset.
 * 
 * Two rentals overlap if:
 * - (rental1.fromDate <= rental2.toDate) AND (rental1.toDate >= rental2.fromDate)
 * 
 * Special cases:
 * - toDate = null means rental is ongoing (asset still with customer)
 * - Ongoing rentals overlap with any future date range
 * 
 * @param assetId - The asset to check
 * @param fromDate - Start date of the new rental period
 * @param toDate - End date of the new rental period (null for ongoing)
 * @param excludeRentalId - Optional rental ID to exclude from the check (for updates)
 * @returns Object with hasOverlap boolean and overlapping rental details if any
 */
export async function checkRentalOverlap(
  assetId: number,
  fromDate: Date,
  toDate: Date | null,
  excludeRentalId?: number
): Promise<{
  hasOverlap: boolean;
  overlappingRental?: {
    id: number;
    fromDate: Date;
    toDate: Date | null;
    customerName: string;
  };
}> {
  // Get all existing rentals for this asset
  const existingRentals = await prisma.assetWithCustomer.findMany({
    where: {
      assetId,
      ...(excludeRentalId ? { id: { not: excludeRentalId } } : {}),
    },
    include: {
      customer: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  for (const rental of existingRentals) {
    const existingFrom = rental.fromDate;
    const existingTo = rental.toDate;

    // Check for overlap
    // Case 1: Existing rental is ongoing (no toDate)
    // - Overlaps if new rental starts before or has no end
    if (existingTo === null) {
      // Ongoing rental overlaps with any rental that starts or extends into the future
      // New rental overlaps if: newFrom >= existingFrom OR newTo >= existingFrom (or newTo is null)
      if (toDate === null || toDate >= existingFrom) {
        return {
          hasOverlap: true,
          overlappingRental: {
            id: rental.id,
            fromDate: rental.fromDate,
            toDate: rental.toDate,
            customerName: `${rental.customer.firstName} ${rental.customer.lastName}`,
          },
        };
      }
    }
    // Case 2: New rental is ongoing (no toDate)
    // - Overlaps if it starts before existing rental ends
    else if (toDate === null) {
      if (fromDate <= existingTo) {
        return {
          hasOverlap: true,
          overlappingRental: {
            id: rental.id,
            fromDate: rental.fromDate,
            toDate: rental.toDate,
            customerName: `${rental.customer.firstName} ${rental.customer.lastName}`,
          },
        };
      }
    }
    // Case 3: Both have dates - standard overlap check
    else {
      // Two ranges [A, B] and [C, D] overlap if A <= D AND B >= C
      if (fromDate <= existingTo && toDate >= existingFrom) {
        return {
          hasOverlap: true,
          overlappingRental: {
            id: rental.id,
            fromDate: rental.fromDate,
            toDate: rental.toDate,
            customerName: `${rental.customer.firstName} ${rental.customer.lastName}`,
          },
        };
      }
    }
  }

  return { hasOverlap: false };
}

/**
 * Format a date range for display in error messages
 */
export function formatDateRange(fromDate: Date, toDate: Date | null): string {
  const from = fromDate.toLocaleDateString();
  if (toDate === null) {
    return `${from} - ongoing`;
  }
  return `${from} - ${toDate.toLocaleDateString()}`;
}
