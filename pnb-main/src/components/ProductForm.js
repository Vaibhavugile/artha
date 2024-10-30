import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs,query, where,  } from 'firebase/firestore';


import { db } from '../firebase';
import UserSidebar from './UserSidebar'; // Import the UserSidebar component
import UserHeader from './UserHeader';   // Import the UserHeader component
import { useUser } from './Auth/UserContext'; // Assuming you're using a UserContext for branchCode

const ProductForm = () => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [subcategory, setSubcategory] = useState('');  // New state for subcategory
  const [ingredients, setIngredients] = useState([{ ingredientName: '', quantityUsed: '' }]);
  const [allIngredients, setAllIngredients] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [branchCode, setBranchCode] = useState(''); // Store branch code
  const { userData } = useUser(); // Get user data from context

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };
  useEffect(() => {
    if (userData && userData.branchCode) {
      setBranchCode(userData.branchCode);
    }
  }, [userData]);
  // Fetch all ingredients from the inventory to select from
  useEffect(() => {
    const fetchIngredients = async () => {
      const q= query(
        collection(db,'Inventory'),
        where('branchCode','==',userData.branchCode)
      )
      const snapshot = await getDocs(q);
      const ingredientsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllIngredients(ingredientsList);
    };
    
    fetchIngredients();
  }, []);

  const handleAddIngredientField = () => {
    setIngredients([...ingredients, { ingredientName: '', quantityUsed: '' }]);
  };

  const handleInputChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "products"), {
        name: productName,
        branchCode,
        price: parseFloat(price),
        subcategory: subcategory,
        ingredients: ingredients.filter(ing => ing.ingredientName && ing.quantityUsed) // Filter out empty fields
      });
      alert('Product added successfully!');
      setProductName('');
      setPrice('');
      setSubcategory('');
      setIngredients([{ ingredientName: '', quantityUsed: '' }]); // Reset ingredients
    } catch (error) {
      console.error("Error adding product: ", error);
    }
  };

  return (
    <div className={`product-form-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <UserSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />
      <div className="product-form-content">
        <UserHeader onMenuClick={handleSidebarToggle} isSidebarOpen={sidebarOpen} />

        <h2>Add New Product</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Product Name"
            required
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
            required
          />
          <input
            type="text"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            placeholder="Subcategory"
            required
          />

          <h2>Ingredients</h2>
          {ingredients.map((ingredient, index) => (
            <div key={index}>
              <select
                value={ingredient.ingredientName}
                onChange={(e) => handleInputChange(index, 'ingredientName', e.target.value)}
              >
                <option value="">Select Ingredient</option>
                {allIngredients.map((ing) => (
                  <option key={ing.id} value={ing.ingredientName}>
                    {ing.ingredientName} ({ing.quantity} {ing.unit})
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Quantity Used"
                value={ingredient.quantityUsed}
                onChange={(e) => handleInputChange(index, 'quantityUsed', e.target.value)}
              />
            </div>
          ))}
          <button type="button" onClick={handleAddIngredientField}>Add More Ingredients</button>
          <button type="submit">Add Product</button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
