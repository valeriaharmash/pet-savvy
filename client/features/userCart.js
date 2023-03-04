import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { fetchUserOrder, setOrderQty, deleteItem } from './cartSlice';

const UserCart = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();

  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const qtyOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // ensures orders are displayed
  useEffect(() => {
    const getOrder = async () => {
      try {
        const userOrder = await dispatch(fetchUserOrder(userId));
        setCart(userOrder.payload);
        setTotal(userOrder.payload[0].order.total);
      } catch (err) {
        console.error(err);
      }
    };
    getOrder();
  }, []);

  const handleDelete = async (itemId) => {
    // updating the front end
    const updatedCart = cart.filter((item) => item.itemId !== itemId);
    setCart(updatedCart);
    const subTotal = updatedCart.reduce((total, item) => {
      return total + item.item.price * item.qty;
    }, 0);
    setTotal(subTotal);

    // updating the back end
    dispatch(deleteItem({ userId, itemId, subTotal }));
  };

  const handleQuantityChange = async (itemId, quantity) => {
    // updating the front end
    const updatedCart = cart.map((item) => {
      if (item.itemId === itemId) {
        return { ...item, qty: quantity };
      }
      return item;
    });
    setCart(updatedCart);
    const subTotal = updatedCart.reduce((total, item) => {
      return total + item.item.price * item.qty;
    }, 0);
    setTotal(subTotal);

    // updating the back end
    dispatch(setOrderQty({ userId, itemId, quantity }));
  };

  return (
    <div className='content'>
      <div className='container'>
        <h1>Shopping Cart</h1>
        <h3 className='flex-end-column'>{`Total: $${total.toFixed(2)}`}</h3>
        <Link to='/checkout'>
          <button>Checkout</button>
        </Link>
      </div>
      <div>
        {cart.map((item) => {
          return (
            <div key={item.itemId} className='cart-items'>
              <Link to={`/items/${item.itemId}`}>
                <img
                  src={item.item.imageUrl}
                  alt={item.item.name}
                  height='150'
                  width='175'
                />
              </Link>
              <div className='item-description'>
                <Link to={`/items/${item.itemId}`}>
                  <h4>{item.item.name}</h4>
                </Link>
                <p>{item.item.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
                <select
                  style={{ marginBottom: '1rem' }}
                  value={item.qty}
                  onChange={(event) =>
                    handleQuantityChange(item.itemId, event.target.value)
                  }
                >
                  {qtyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <button onClick={() => handleDelete(item.itemId)}>
                  Remove from Cart
                </button>
              </div>
              <div>{`$ ${(item.item.price * item.qty).toFixed(2)}`}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserCart;