var eventBus = new Vue()

Vue.component('product', {
    props: {
      premium: {
        type: Boolean,
        required: true
      }
    },
    template: `
     <div class="product">

        <div class="product-image">
          <img :src="image" />
        </div> <!--end of product-image-->

        <div class="product-info">
            <h1>{{ title }}</h1>
            <p v-if="inStock">In Stock</p>
            <p v-else>Out of Stock</p>

            <div class="color-box"
                 v-for="(variant, index) in variants" 
                 :key="variant.variantId"
                 :style="{ backgroundColor: variant.variantColor }"
                 @click="updateProduct(index)"
                 >
            </div> <!--end of color-box-->

            <button v-on:click="addToCart" 
              :disabled="!inStock"
              :class="{ disabledButton: !inStock }"
              >
            Add to cart
            </button>

          </div> <!--end of product-info-->
          
          <div class="reviews-details">
            <p>Shipping: {{ shipping }}</p>
            <ul>
              <p>Details</p>
              <li v-for="detail in details">{{ detail }}</li>
            </ul>
            <product-tabs :reviews="reviews"></product-tabs>
          </div> <!--end of reviews-details-->

      </div> <!--end of product-->
     `,
    data() {
      return {
          product: 'Marlin 7 Gen 2 Mountain Bike',
          brand: 'Trek',
          selectedVariant: 0,
          details: ['Alpha Silver Aluminium Frame','14g Stainless Steel Spokes','Weight: 13.77 kg'],
          variants: [
            {
              variantId: 2234,
              variantPrice: 1450,
              variantColor: 'red',
              variantImage: './images/red-bike.jpg',
              variantQuantity: 10     
            },
            {
              variantId: 2235,
              variantPrice: 1450,
              variantColor: 'grey',
              variantImage: './images/black-bike.jpg',
              variantQuantity: 10     
            },
            {
              variantId: 2236,
              variantPrice: 1450,
              variantColor: 'teal',
              variantImage: './images/mint-bike.jpg',
              variantQuantity: 0     
            }
          ],
          reviews: []
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
            this.$emit('add-to-cart', cartItem)
        },
        updateProduct(index) {  
            this.selectedVariant = index
        }
      },
      computed: {
          title() {
              return this.brand + ' ' + this.product  
          },
          image(){
              return this.variants[this.selectedVariant].variantImage
          },
          inStock(){
              return this.variants[this.selectedVariant].variantQuantity
          },
          shipping() {
            if (this.premium) {
              return "Free"
            }
              return 15.99
          }
      },
      mounted() {
        eventBus.$on('review-submitted', productReview => {
          this.reviews.push(productReview)
        })
      }
  })

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

Vue.component('info-tabs', {
    props: {
      shipping: {
        required: true
      },
      details: {
        type: Array,
        required: true
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

        <div v-show="selectedTab === 'Shipping'">
          <p>{{ shipping }}</p>
        </div>

        <div v-show="selectedTab === 'Details'">
          <ul>
            <li v-for="detail in details">{{ detail }}</li>
          </ul>
        </div>
    
      </div>
    `,
    data() {
      return {
        tabs: ['Shipping', 'Details'],
        selectedTab: 'Shipping'
      }
    }
  })
  
  Vue.component('cart-content', {
    props: {
      items: {
        type: Array,
        required: true
      }
    },
    template: `
      <div class="cart-content">
        <h2>Your cart</h2>
        <table v-if="items.length">
        <thead >
          <tr>
            <th>Num.</th>
            <th>Item</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in items">
            <td>{{index + 1}}.</td>
            <td>{{item.product}} - {{item.color}}</td>
            <td>$ {{item.price}}</td>
          </tr>
        </tbody>
      </table>
      <p v-else>Your cart is empty</p>
      </div>
    `
  })

  var app = new Vue({
      el: '#app',
      data: {
        premium: true,
        cart: []
      },
      methods: {
        updateCart(id) {
          this.cart.push(id)
        }
      }
  })