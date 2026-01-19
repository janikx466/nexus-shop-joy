import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  createdAt: Date;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Product[];
        
        setProducts(productsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: new Date(),
    });
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    await updateDoc(doc(db, 'products', id), product);
  };

  const deleteProduct = async (id: string) => {
    await deleteDoc(doc(db, 'products', id));
  };

  return { products, loading, addProduct, updateProduct, deleteProduct };
};
