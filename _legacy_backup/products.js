/* 
   Winners Superfrip - Product Database
   This file contains the list of all products.
   Admins can add new products by copying the structure of an existing object.
*/

const products = [
    {
        id: "001",
        name: "Vintage Nike Hoodie",
        price: 45,
        currency: "€",
        category: "hauts",
        size: "L",
        condition: "seconde_main", // neuf, seconde_main, comme_neuf
        origin: "europe", // europe, local, autre
        style: "streetwear",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80", // Placeholder
        description: "Authentic vintage Nike hoodie from the 90s. Great condition, minor wear on cuffs.",
        isNewArrival: true
    },
    {
        id: "002",
        name: "Classic Denim Jacket",
        price: 60,
        currency: "€",
        category: "vestes",
        size: "M",
        condition: "comme_neuf",
        origin: "europe",
        style: "vintage",
        image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=600&q=80",
        description: "Classic blue denim jacket. Perfect for layering.",
        isNewArrival: true
    },
    {
        id: "003",
        name: "Floral Summer Dress",
        price: 25,
        currency: "€",
        category: "robes",
        size: "S",
        condition: "neuf",
        origin: "local",
        style: "chic",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80",
        description: "Brand new floral dress, lightweight and perfect for summer.",
        isNewArrival: false
    },
    {
        id: "004",
        name: "Oversized Graphic Tee",
        price: 20,
        currency: "€",
        category: "hauts",
        size: "XL",
        condition: "seconde_main",
        origin: "europe",
        style: "streetwear",
        image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=600&q=80",
        description: "Cool graphic tee with a retro vibe.",
        isNewArrival: false
    },
    {
        id: "005",
        name: "Leather Boots",
        price: 85,
        currency: "€",
        category: "chaussures",
        size: "42",
        condition: "seconde_main",
        origin: "europe",
        style: "vintage",
        image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=600&q=80",
        description: "Genuine leather boots, very durable and stylish.",
        isNewArrival: true
    }
];

// Export for use in other files if using modules, but for simple script tags we just rely on global scope.
// We will attach it to the window object to be safe.
window.products = products;
