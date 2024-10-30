import React, { useEffect, useState } from 'react';
import { collection, getDocs,query, where,} from 'firebase/firestore';
import { db } from '../firebase';
import UserSidebar from './UserSidebar';  // Import the UserSidebar component
import UserHeader from './UserHeader';    // Import the UserHeader component
import { useUser } from './Auth/UserContext'; // Assuming you're using a UserContext for branchCode
 
// Assuming you have some custom CSS for this page

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar toggle state
  const [branchCode, setBranchCode] = useState(''); // Store branch code
  const { userData } = useUser(); // Get user data from context

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen); // Toggle sidebar visibility
  };
  useEffect(() => {
    if (userData && userData.branchCode) {
      setBranchCode(userData.branchCode);
    }
  }, [userData]);

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(
        collection(db,'products'),
        where('branchCode','==',userData.branchCode)
      )
      const productSnapshot = await getDocs(q);
      const productList = productSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    };
    fetchProducts();
  }, []);

  return (
    <div className={`product-list-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Include the sidebar and header */}
      <UserSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      <div className="product-list-content">
        <UserHeader onMenuClick={handleSidebarToggle} isSidebarOpen={sidebarOpen} />

        <h2>Product List</h2>
        {products.length > 0 ? (
          products.map(product => (
            <div key={product.id} className="product-item">
              <h3>{product.name}</h3>
              <p>Price: ${product.price}</p>
            </div>
          ))
        ) : (
          <p>No products available</p>
        )}
      </div>
    </div>
  );
};

export default ProductList;
