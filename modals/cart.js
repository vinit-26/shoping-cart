let Cart;
module.exports = function Cart(oldItems) {
  this.items = oldItems.items || {};
  this.totalQty = oldItems.totalQty || 0;
  this.totalPrice = oldItems.totalPrice || 0;

  this.add = (item, id) => {
    var storedItem = this.items[id];
    if (!storedItem) {
      storedItem = this.items[id] = { item: item, qty: 0, price: 0 };
    }
    storedItem.qty++;
    storedItem.price = storedItem.item.price * storedItem.qty;
    this.totalQty++;
    this.totalPrice += storedItem.item.price;
  };

  this.removeByOne = (id) => {
    this.items[id].qty--;
    this.items[id].price -= this.items[id].item.price;
    this.totalQty--;
    this.totalPrice -= this.items[id].item.price;
    if (this.items[id].qty <= 0) {
      delete this.items[id];
    }
  };

  this.removeItem = (id) => {
    this.totalQty -= this.items[id].qty;
    this.totalPrice -= this.items[id].price;
    delete this.items[id];
  };

  this.generateArr = () => {
    var arr = [];
    for (var id in this.items) {
      arr.push(this.items[id]);
    }
    return arr;
  };
};
