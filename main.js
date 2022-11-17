// Event bus ------------------------------------------------------------------
var eventBus = new Vue()

// Product --------------------------------------------------------------------
Vue.component('product', {
  props: {
    premium: {
      type: Boolean,
      required: true,
    }
  },
  template: `
    <div class="product">
      <div class="product-image">
        <img :src="image"/>
      </div>

      <div class="product-info">
        <h1 class="product-title">{{ title }}</h1>
        <h3>Details</h3>
        <ul>
          <li v-for="detail in details">{{ detail}}</li>
        </ul>
        
        <h3>More Colours</h3>
        <ul class="variants">
          <li v-for="(variant, index) in variants" 
              :key="variant.variantId"
              class="color-box"
              :style="{ backgroundColor: variant.variantColor }"
              @click="updateProduct(index)"
          >
          </li>
        </ul>

        <p>Price: $ {{price}}</p>

        <p>{{ productStatus }}</p>

        <button 
          @click="addToCart" 
          class="button"
          :class="{ '-disabled': !inStock }"
          :disabled="!inStock"
        >Add to cart</button>

        <p><small>(Shipping fee: {{ shipping }})<small></p>
      </div>

      <product-tabs :reviews="reviews"></product-tabs>

    </div>
  `,
  data() { // In components instead of data object we use a data function which returns an object.
    return {
      product: 'Marlin 7 Gen 2 Mountain Bike',
      brand: 'Trek',
      selectedVariant: 0,
      details: ['Alpha Silver Aluminium Frame','14g Stainless Steel Spokes','Weight: 13.77 kg'],
      variants: [
        {
          variantId: 2234,
          variantPrice: 1449.99,
          variantColor: 'red',
          variantImage: './images/red-bike.jpg',
          variantQuantity: 15     
        },
        {
          variantId: 2235,
          variantPrice: 1459.99,
          variantColor: 'grey',
          variantImage: './images/black-bike.jpg',
          variantQuantity: 22     
        },
        {
          variantId: 2236,
          variantPrice: 1469.99,
          variantColor: 'teal',
          variantImage: './images/mint-bike.jpg',
          variantQuantity: 5     
        }
      ],
      classes: {
        active: true,
        '-disabled': false,
      },
      reviews: [],
    }
  },
  methods: {
    addToCart: function() {
      let cartItem = {
        product: this.product,
        variant: this.variants[this.selectedVariant].variantId,
        color: this.variants[this.selectedVariant].variantColor,
        price: this.variants[this.selectedVariant].variantPrice,
      };
      this.$emit('add-to-cart', cartItem);
      // Reduce available items number.
      this.variants[this.selectedVariant].variantQuantity -= 1;
    },
    updateProduct(index) { 
      this.selectedVariant = index;
    }
  },
  computed: {
    // joins brand and product name
    title() {
      return this.brand + ' ' + this.product  
    },
    // selects variant image to match color-box
    image() {
      return this.variants[this.selectedVariant].variantImage;
    },
    // shows stock availability 
    inStock() {
      return this.variants[this.selectedVariant].variantQuantity;
    },
    price() {
      return this.variants[this.selectedVariant].variantPrice;
    },
    productStatus() {
      const quantity = this.variants[this.selectedVariant].variantQuantity;
      if (quantity > 10) {
        return 'In stock.';
      } else if (quantity <= 10 && quantity > 1 ) {
        return `Almost sold out, only ${quantity} items are available!`;
      } else if (quantity == 1 ) {
        return `Hurry! Just 1 item is available!`;
      } else {
        return 'Out of stock.'
      }
    },
    shipping() {
      if (this.premium) {
        return "Free";
      } else {
        return "$15.99";
      }
    }
  },
  mounted() {
    eventBus.$on('review-submitted', productReview => {
      this.reviews.push(productReview);
    }),
    eventBus.$on('cart-item-deleted', variant => {
      for (let index = 0, max = this.variants.length; index < max; index++) {
        const currentVarinat = this.variants[index];
        const variantId = currentVarinat.variantId;
        if (variantId === variant) {
          currentVarinat.variantQuantity += 1;
          return;
        }
      }
    })
  }
})

// Review ---------------------------------------------------------------------
Vue.component('product-review', {
  template: `
  <form class="review-form" @submit.prevent="onSubmit">
    <p>
      <label for="name">Name:</label>
      <input id="name" v-model="name" required>
    </p>
    <p>
      <label for="review">Review:</label>      
      <textarea id="review" v-model="review" required></textarea>
    </p>
    <p>
      <label for="rating">Rating:</label>
      <select id="rating" v-model.number="rating" required>
        <option>5</option>
        <option>4</option>
        <option>3</option>
        <option>2</option>
        <option>1</option>
      </select>
    </p>
    <p>
      <input type="submit" value="Submit">  
    </p>    

  </form>
  `,
  data() {
    return {
      name: null,
      review: null,
      rating: null,
      errors: []
    }
  },
  methods: {
    onSubmit() {
      this.errors = []
      if (this.name && this.review && this.rating) {
        let productReview = {
          name: this.name,
          review: this.review,
          rating: this.rating
        }
        eventBus.$emit('review-submitted', productReview)
        this.name = null
        this.review = null
        this.rating = null
      }
    }
  }
})

// Product-tabs ---------------------------------------------------------------
Vue.component('product-tabs', {
  props: {
    reviews: {
      type: Array,
      required: false
    }
  },
  template: `
    <div>
    
      <ul>
        <span class="tabs" 
              :class="{ activeTab: selectedTab === tab }"
              v-for="(tab, index) in tabs"
              @click="selectedTab = tab"
              :key="tab"
        >{{ tab }}</span>
      </ul>
      <div v-show="selectedTab === 'Reviews'">
          <p v-if="!reviews.length">There are no reviews yet.</p>
          <ul v-else>
              <li v-for="(review, index) in reviews" :key="index">
                <p>{{ review.name }}</p>
                <p>Rating:{{ review.rating }}</p>
                <p>{{ review.review }}</p>
              </li>
          </ul>
      </div>
      <div v-show="selectedTab === 'Make a Review'">
        <product-review></product-review>
      </div>
  
    </div>
  `,
  data() {
    return {
      tabs: ['Reviews', 'Make a Review'],
      selectedTab: 'Reviews'
    }
  }
})


// Cart-content ---------------------------------------------------------------
Vue.component('cart-content', {
  props: {
    showCartContent: {
      type: Boolean,
      required: true,
    },
    items: {
      type: Array,
      required: false
    }
  },
  template: `
    <div v-show="showCartContent" class="cart-content">
      <button @click="hideCartContent" class="cart-content__close">Close</button>

      <h2 class="cart-content__title">Your cart</h2>

      <table v-if="items.length" class="cart-items">
        <thead class="cart-items__head">
          <tr>
            <th class="cart-items__num-label">Num.</th>
            <th class="cart-items__product-label">Item</th>
            <th class="cart-items__price-label">Price</th>
            <th class="cart-items__action">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items">
            <td>{{index + 1}}.</td>
            <td class="cart-items__product">{{item.product}} - {{item.color}}</td>
            <td class="cart-items__price">$ {{item.price}}</td>
            <td class="cart-items__action">
              <button @click="deleteItem(index, item.variant)">
                Remove
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan=2>Total:</td>
            <td class="cart-items__total">$ {{cartTotal}}</td>
            <td class="cart-items__action"></td>
          </tr>
        </tfoot>
      </table>

      <p v-else>Your cart is empty.</p>
    </div>
  `,
  methods: {
    hideCartContent() {
      // Not OK, because showCartContent in app doesn't change!
      // this.showCartContent = false;

      // So change the root data instead!
      // See: https://vuejs.org/v2/guide/components-edge-cases.html#Accessing-the-Root-Instance
      this.$root.showCartContent = false;
    },
    deleteItem(index, variant) {
      this.$root.cart.splice(index, 1);
      eventBus.$emit('cart-item-deleted', variant);
    }
  },
  computed: {
    cartTotal() {
      return this.items.reduce((total, item) => total + item.price, 0).toFixed(2);
    }
  }
})

// App ------------------------------------------------------------------------
var app = new Vue({ // Vue instance with options object passed as parameter.
  el: '#app',
  data: {
    premium: true,
    showCartContent: false,
    cart: [],
  },
  methods: {
    updateCart(item) {
      this.cart.push(item);
    },
    toggleCartContent() {
      this.showCartContent = !this.showCartContent;
    }
  }
})

Vue.config.devtools = true;
