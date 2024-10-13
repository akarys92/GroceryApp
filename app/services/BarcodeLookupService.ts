// app/services/BarcodeLookupService.ts

export interface ProductInfo {
    name: string;
    // Add more fields if needed
}

class BarcodeLookupService {
    private static instance: BarcodeLookupService;

    private constructor() { }

    static getInstance() {
        if (!BarcodeLookupService.instance) {
            BarcodeLookupService.instance = new BarcodeLookupService();
        }
        return BarcodeLookupService.instance;
    }

    async lookupBarcode(barcode: string): Promise<ProductInfo | null> {
        try {
            const response = await fetch(
                `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
            );

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            if (data.status === 1) {
                // Product found
                const productName = data.product.product_name || data.product.generic_name;
                return {
                    name: productName || 'Unknown Product',
                };
            } else {
                // Product not found
                return null;
            }
        } catch (error) {
            console.error('Error fetching product data:', error);
            return null;
        }
    }
}

export default BarcodeLookupService.getInstance();
