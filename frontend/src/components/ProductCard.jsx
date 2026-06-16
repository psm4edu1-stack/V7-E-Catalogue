import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLikes } from "../context/LikesContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/currency";
import { Heart, ShoppingCart, Percent } from "lucide-react";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const { toggleLike, isLiked, getLikesCount } = useLikes();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const liked = isLiked(product.id);
  const likesCount = getLikesCount(product);

  const hasOffer =
    product.special_price &&
    Number(product.special_price) < Number(product.price);

  const discountPercentage =
    product.offer_percentage ||
    (hasOffer
      ? Math.round(
          ((Number(product.price) - Number(product.special_price)) /
            Number(product.price)) *
            100
        )
      : 0);

  // ==========================
  // Favourite Button
  // ==========================
  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please login to add products to favourites");
      navigate("/login");
      return;
    }

    toggleLike(product.id);
  };

  // ==========================
  // Add To Cart Button
  // ==========================
  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    addToCart(product);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="
        group
        relative
        flex
        flex-col
        w-full
        rounded-2xl
        border
        border-[var(--border-color)]
        bg-[var(--bg-secondary)]
        overflow-hidden
        transition-all
        duration-300
        hover:shadow-lg
        hover:-translate-y-1.5
      "
    >
      {/* Product Image */}
      <div className="relative aspect-square w-full bg-[var(--bg-tertiary)] overflow-hidden">
        <img
          src={
            product.image_url ||
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
          }
          alt={product.name}
          className="
            h-full
            w-full
            object-cover
            object-center
            group-hover:scale-105
            transition-transform
            duration-500
          "
        />

        {/* Offer Badge */}
        {hasOffer && (
          <div
            className="
              absolute
              top-3
              left-3
              px-2.5
              py-1
              rounded-lg
              bg-rose-500
              text-white
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              flex
              items-center
              gap-1
              shadow-sm
            "
          >
            <Percent size={10} />
            {discountPercentage}% OFF
          </div>
        )}

        {/* Favourite Button */}
        <button
          onClick={handleLikeClick}
          className={`absolute top-3 right-3 p-2 rounded-xl transition-all duration-200 shadow-sm border ${
            liked
              ? "bg-rose-50 border-rose-100 text-rose-500"
              : "bg-white/80 backdrop-blur-sm border-white/40 text-[var(--text-secondary)] hover:text-rose-500 hover:scale-105"
          }`}
          title={liked ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Heart
            size={16}
            fill={liked ? "currentColor" : "none"}
            className={liked ? "animate-heartBeat" : ""}
          />
        </button>

        {/* Stock Status */}
        {product.availability_status &&
          product.availability_status !== "in_stock" && (
            <div
              className="
                absolute
                bottom-3
                left-3
                px-2.5
                py-1
                rounded-md
                bg-black/60
                backdrop-blur-sm
                text-white
                text-[10px]
                font-semibold
                uppercase
                tracking-wider
              "
            >
              {product.availability_status.replace("_", " ")}
            </div>
          )}
      </div>

      {/* Card Details */}
      <div className="flex flex-col flex-1 p-4">
        <span
          className="
            text-[11px]
            font-semibold
            text-primary
            uppercase
            tracking-wider
            mb-1
          "
        >
          {product.category || "General"}
        </span>

        <h3
          className="
            font-display
            font-bold
            text-sm
            text-[var(--text-primary)]
            group-hover:text-primary
            transition-colors
            line-clamp-1
            mb-2
          "
        >
          {product.name}
        </h3>

        {/* Price & Actions */}
        <div
          className="
            mt-auto
            flex
            items-center
            justify-between
            pt-2
            border-t
            border-[var(--border-color)]
            border-dashed
          "
        >
          <div className="flex flex-col">
            {hasOffer ? (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-rose-500 font-extrabold text-sm sm:text-base">
                    {formatPrice(product.special_price)}
                  </span>

                  <span className="text-xs text-[var(--text-tertiary)] line-through">
                    {formatPrice(product.price)}
                  </span>
                </div>

                <span className="text-[9px] text-rose-500 font-medium">
                  Save{" "}
                  {formatPrice(
                    Number(product.price) - Number(product.special_price)
                  )}
                </span>
              </>
            ) : (
              <span className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Likes Count */}
            <span
              className="
                text-[11px]
                text-[var(--text-secondary)]
                font-medium
                flex
                items-center
                gap-0.5
              "
            >
              <Heart
                size={10}
                className="text-rose-400"
                fill="currentColor"
              />
              {likesCount}
            </span>

            {/* Cart Button */}
            <button
              onClick={handleCartClick}
              disabled={
                product.availability_status === "out_of_stock"
              }
              className={`p-2.5 rounded-xl transition-all ${
                product.availability_status === "out_of_stock"
                  ? "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed"
                  : "bg-primary hover:bg-primary-hover text-white hover:scale-105 shadow-sm"
              }`}
              title="Add to Cart"
            >
              <ShoppingCart size={14} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;