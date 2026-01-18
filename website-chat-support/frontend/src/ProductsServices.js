// ProductsServices.js
import React from "react";

function ProductsServices() {
  const products = [
    {
      icon: "💰",
      title: "Savings Account",
      description: "Secure your future with high-interest savings accounts and easy access to funds."
    },
    {
      icon: "💳",
      title: "Checking Account",
      description: "Manage your daily transactions with convenience and zero hidden charges."
    },
    {
      icon: "📊",
      title: "Loans",
      description: "Flexible loan options for personal, home, and auto needs with quick approvals."
    },
    {
      icon: "💎",
      title: "Credit Cards",
      description: "Enjoy rewards, cashback, and secure payments with our range of credit cards."
    },
    {
      icon: "📈",
      title: "Investment Services",
      description: "Grow your wealth with expert guidance and diverse investment opportunities."
    },
    {
      icon: "🛡️",
      title: "Insurance",
      description: "Protect yourself and your family with comprehensive insurance plans."
    }
  ];

  return (
    <div className="products-container">
      <div className="products-header">
        <h2>Our Products & Services</h2>
        <p>Explore the wide range of financial solutions we offer to meet your needs.</p>
      </div>

      <div className="product-grid">
        {products.map((product, index) => (
          <div key={index} className="product-card">
            <div className="service-icon">{product.icon}</div>
            <h3>{product.title}</h3>
            <p>{product.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductsServices;