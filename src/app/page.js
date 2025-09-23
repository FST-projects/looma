"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebaseClient";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import "./homepage.css";
import Loading from "./components/Loading";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Add userData state
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const heroRef = useRef(null);
  const heroBackgroundRef = useRef(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("User object:", user); // Debug log
      console.log("User photoURL:", user?.photoURL); // Debug log
      console.log("User displayName:", user?.displayName); // Debug log

      setUser(user);

      // Fetch user data from Firestore if user exists
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            console.log("User data from Firestore:", userDoc.data()); // Debug log
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Initialize animations and effects
  useEffect(() => {
    if (!loading) {
      initAnimations();
    }
  }, [loading]);

  const initAnimations = () => {
    // Initialize lazy loading
    initLazyLoading();

    // Initialize mobile menu
    initMobileMenu();

    // Initialize smooth scrolling
    initSmoothScrolling();

    // Initialize newsletter form
    initNewsletterForm();

    // Initialize scroll animations
    initScrollAnimations();

    // Initialize hero hover effect
    initHeroHoverEffect();

    // Initialize card animations
    initCardAnimations();

    // Initialize touch events
    initTouchEvents();
  };

  // Enhanced card animations
  const initCardAnimations = () => {
    const articleCards = document.querySelectorAll(".article-card");

    articleCards.forEach((card) => {
      const shine = document.createElement("div");
      shine.classList.add("card-shine");
      card.appendChild(shine);

      card.addEventListener("mouseenter", function (e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const xPercent = Math.round((x / rect.width) * 100);
        const yPercent = Math.round((y / rect.height) * 100);

        shine.style.background = `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%)`;

        card.style.transform = "translateY(-8px) scale(1.02)";
        card.style.boxShadow = "0 20px 35px -10px rgba(0, 0, 0, 0.15)";

        const img = card.querySelector(".article-image img");
        if (img) {
          img.style.transform = "scale(1.08)";
        }

        const content = card.querySelector(".article-content");
        if (content) {
          content.style.transform = "translateY(-5px)";
        }

        const link = card.querySelector(".article-link");
        if (link) {
          link.style.transform = "translateX(4px)";
        }
      });

      card.addEventListener("mouseleave", function () {
        card.style.transform = "translateY(0) scale(1)";
        card.style.boxShadow = "var(--shadow)";
        shine.style.background = "transparent";

        const img = card.querySelector(".article-image img");
        if (img) {
          img.style.transform = "scale(1)";
        }

        const content = card.querySelector(".article-content");
        if (content) {
          content.style.transform = "translateY(0)";
        }

        const link = card.querySelector(".article-link");
        if (link) {
          link.style.transform = "translateX(0)";
        }
      });

      card.addEventListener("mousemove", function (e) {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const xPercent = Math.round((x / rect.width) * 100);
        const yPercent = Math.round((y / rect.height) * 100);

        shine.style.background = `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%)`;

        const tiltX = (xPercent - 50) / 25;
        const tiltY = (yPercent - 50) / 25;

        card.style.transform = `translateY(-8px) scale(1.02) rotateX(${tiltY}deg) rotateY(${tiltX}deg)`;
      });
    });
  };

  // Lazy loading for images
  const initLazyLoading = () => {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');

    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.classList.add("loaded");
              imageObserver.unobserve(img);
            }
          });
        },
        {
          rootMargin: "0px 0px 100px 0px",
        }
      );

      lazyImages.forEach((img) => {
        imageObserver.observe(img);
      });
    } else {
      lazyImages.forEach((img) => {
        img.classList.add("loaded");
      });
    }
  };

  // Mobile menu toggle
  const initMobileMenu = () => {
    const menuToggle = document.querySelector(".mobile-menu-toggle");
    const navMenu = document.querySelector(".nav-menu");

    if (menuToggle && navMenu) {
      menuToggle.addEventListener("click", function () {
        navMenu.classList.toggle("active");
        menuToggle.classList.toggle("active");

        const spans = menuToggle.querySelectorAll("span");
        if (navMenu.classList.contains("active")) {
          spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
          spans[1].style.opacity = "0";
          spans[2].style.transform = "rotate(-45deg) translate(7px, -6px)";
        } else {
          spans[0].style.transform = "none";
          spans[1].style.opacity = "1";
          spans[2].style.transform = "none";
        }
      });
    }
  };

  // Smooth scrolling for anchor links
  const initSmoothScrolling = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();

        const targetId = this.getAttribute("href");
        if (targetId === "#") return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const targetPosition =
            targetElement.getBoundingClientRect().top + window.pageYOffset;
          const startPosition = window.pageYOffset;
          const distance = targetPosition - startPosition;
          const duration = 800;
          let start = null;

          function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const easeInOutQuad = (t) =>
              t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            const percent = Math.min(progress / duration, 1);

            window.scrollTo(
              0,
              startPosition + distance * easeInOutQuad(percent)
            );

            if (progress < duration) {
              window.requestAnimationFrame(step);
            }
          }

          window.requestAnimationFrame(step);

          const navMenu = document.querySelector(".nav-menu");
          const menuToggle = document.querySelector(".mobile-menu-toggle");
          if (navMenu && navMenu.classList.contains("active")) {
            navMenu.classList.remove("active");
            const spans = menuToggle.querySelectorAll("span");
            spans[0].style.transform = "none";
            spans[1].style.opacity = "1";
            spans[2].style.transform = "none";
          }
        }
      });
    });
  };

  // Newsletter form handling
  const initNewsletterForm = () => {
    const newsletterForm = document.querySelector(".newsletter-form");

    if (newsletterForm) {
      newsletterForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value.trim();

        if (validateEmail(email)) {
          const submitBtn = this.querySelector("button");
          const originalText = submitBtn.textContent;

          submitBtn.textContent = "Subscribing...";
          submitBtn.disabled = true;
          submitBtn.style.transform = "scale(0.98)";

          setTimeout(() => {
            submitBtn.style.transform = "scale(1)";
            submitBtn.textContent = "Subscribed!";
            submitBtn.style.backgroundColor = "#10b981";

            setTimeout(() => {
              submitBtn.textContent = originalText;
              submitBtn.disabled = false;
              submitBtn.style.backgroundColor = "";
              emailInput.value = "";
            }, 1500);
          }, 1000);
        } else {
          emailInput.style.animation = "shake 0.5s";
          setTimeout(() => {
            emailInput.style.animation = "";
          }, 500);
        }
      });
    }
  };

  // Email validation
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Scroll animations for elements
  const initScrollAnimations = () => {
    const animatedElements = document.querySelectorAll(
      ".article-card, .section-title"
    );

    animatedElements.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition =
        "transform 0.6s cubic-bezier(0.215, 0.61, 0.355, 1), opacity 0.6s ease";
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("animate-in");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px",
        }
      );

      animatedElements.forEach((el) => {
        observer.observe(el);
      });
    }
  };

  // Hero background hover effect
  const initHeroHoverEffect = () => {
    const hero = document.querySelector(".hero");
    const heroBackground = document.querySelector(".hero-background");

    if (hero && heroBackground) {
      hero.addEventListener("mousemove", function (e) {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        heroBackground.style.transform = `scale(1.1) translate(${
          x * 20 - 10
        }px, ${y * 20 - 10}px)`;
      });

      hero.addEventListener("mouseleave", function () {
        heroBackground.style.transition =
          "transform 1.2s cubic-bezier(0.215, 0.61, 0.355, 1)";
        heroBackground.style.transform = "scale(1.05)";

        setTimeout(() => {
          heroBackground.style.transition = "";
        }, 1200);
      });
    }
  };

  // Debounce function for performance
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = debounce(function () {
      const navMenu = document.querySelector(".nav-menu");
      const menuToggle = document.querySelector(".mobile-menu-toggle");

      if (
        window.innerWidth > 768 &&
        navMenu &&
        navMenu.classList.contains("active")
      ) {
        navMenu.classList.remove("active");
        const spans = menuToggle.querySelectorAll("span");
        spans[0].style.transform = "none";
        spans[1].style.opacity = "1";
        spans[2].style.transform = "none";
      }
    }, 250);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Updated helper functions that use both user and userData
  const getUserProfileImage = (user, userData) => {
    // Priority 1: Custom profile picture from Firestore
    if (userData?.customProfilePicture) {
      return userData.customProfilePicture;
    }

    // Priority 2: Google profile photo from Auth
    if (user?.photoURL) {
      return user.photoURL;
    }

    // Return empty string to trigger letter avatar fallback
    return "";
  };

  const getUserDisplayName = (user, userData) => {
    // Priority 1: First name + Last name from Firestore
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }

    // Priority 2: First name only from Firestore
    if (userData?.firstName) {
      return userData.firstName;
    }

    // Priority 3: Google display name from Auth
    if (user?.displayName) {
      return user.displayName;
    }

    // Priority 4: Email username fallback
    return user?.email?.split("@")[0] || "User";
  };

  const getUserInitial = (user, userData) => {
    // Priority 1: First letter of first name from Firestore
    if (userData?.firstName) {
      return userData.firstName.charAt(0).toUpperCase();
    }

    // Priority 2: First letter of display name from Auth
    if (user?.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }

    // Priority 3: First letter of email
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }

    // Fallback
    return "U";
  };

  // Add touch events
  const initTouchEvents = () => {
    document.addEventListener("touchstart", function () {}, { passive: true });

    document.addEventListener(
      "touchstart",
      function () {
        document.body.classList.add("using-touch");
      },
      { once: true }
    );

    document.addEventListener("touchstart", function (e) {
      if (
        e.target.tagName === "A" ||
        e.target.tagName === "BUTTON" ||
        e.target.closest("button") ||
        e.target.closest("a")
      ) {
        document.body.classList.add("touch-active");

        setTimeout(function () {
          document.body.classList.remove("touch-active");
        }, 300);
      }
    });
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="home-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="logo-container">
            <img
              src="/looma-logo.png"
              style={{ width: "140px" }}
              alt="Looma Logo"
            />
          </div>

          <nav className="nav-menu">
            <a href="#" className="nav-link">
              Technology
            </a>
            <a href="#" className="nav-link">
              Games
            </a>
            <a href="#" className="nav-link">
              Reviews
            </a>
            <a href="#" className="nav-link">
              Guides
            </a>
          </nav>

          <div className="header-actions">
            <div className="search-container">
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search articles..."
                style={{ fontFamily: "Exo 2, sans-serif" }}
              />
            </div>

            {user ? (
              <div className="user-profile">
                <div className="user-avatar-container">
                  {getUserProfileImage(user, userData) ? (
                    <img
                      src={getUserProfileImage(user, userData)}
                      alt={getUserDisplayName(user, userData)}
                      className="user-avatar"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Show letter avatar when image fails to load
                        e.target.style.display = "none";
                        const letterAvatar =
                          document.querySelector(".letter-avatar");
                        if (letterAvatar) {
                          letterAvatar.style.display = "flex";
                        }
                      }}
                    />
                  ) : (
                    <div className="letter-avatar">
                      {getUserInitial(user, userData)}
                    </div>
                  )}
                </div>
                <span className="user-name">
                  {getUserDisplayName(user, userData)}
                </span>
                <div className="user-dropdown">
                  <a href="/profile">Profile</a>
                  <a href="/settings">Settings</a>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <a href="/login" className="login-btn">
                  Login
                </a>
                <a href="/signup" className="signup-btn">
                  Sign Up
                </a>
              </div>
            )}

            <button className="mobile-menu-toggle">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" ref={heroRef}>
        <div className="hero-background" ref={heroBackgroundRef}></div>
        <div className="hero-content">
          <h1 className="hero-title">Explore the Latest in Tech and Gaming</h1>
          <p className="hero-description">
            Dive into insightful articles, reviews, and guides on the newest
            technology trends and gaming experiences. Stay updated with expert
            analysis and in-depth coverage.
          </p>
          <button className="hero-cta" onClick={() => router.push("/articles")}>
            Start Exploring
          </button>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="featured-articles">
        <div className="container">
          <h2 className="section-title">Featured Articles</h2>
          <div className="articles-grid">
            <article className="article-card">
              <div className="article-image">
                <img
                  src="https://images.unsplash.com/photo-1674027214993-52de23be5a18?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXJ0aWZpY2lhbCUyMGludGVsbGlnZW5jZSUyMGZ1dHVyZXxlbnwwfHwwfHx8MA%3D%3D"
                  alt="The Future of AI in Everyday Life"
                  loading="lazy"
                />
              </div>
              <div className="article-content">
                <h3 className="article-title">
                  The Future of AI in Everyday Life
                </h3>
                <p className="article-excerpt">
                  Artificial intelligence is rapidly transforming how we live
                  and work. This article explores the latest advancements and
                  their impact on society.
                </p>
                <a href="/articles/ai-future" className="article-link">
                  Read more
                </a>
              </div>
            </article>

            <article className="article-card">
              <div className="article-image">
                <img
                  src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
                  alt="Top 5 Games of the Year"
                  loading="lazy"
                />
              </div>
              <div className="article-content">
                <h3 className="article-title">
                  Top 5 Games of the Year: A Comprehensive Review
                </h3>
                <p className="article-excerpt">
                  Our expert team reviews the best games released this year,
                  providing in-depth analysis and recommendations for every
                  gamer.
                </p>
                <a href="/articles/top-games" className="article-link">
                  Read more
                </a>
              </div>
            </article>

            <article className="article-card">
              <div className="article-image">
                <img
                  src="https://images.unsplash.com/photo-1468436139062-f60a71c5c892?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
                  alt="Must-Have Tech Gadgets for 2024"
                  loading="lazy"
                />
              </div>
              <div className="article-content">
                <h3 className="article-title">
                  Must-Have Tech Gadgets for 2024
                </h3>
                <p className="article-excerpt">
                  Stay ahead of the curve with our curated list of essential
                  tech gadgets that will enhance your daily life and
                  productivity.
                </p>
                <a href="/articles/tech-gadgets" className="article-link">
                  Read more
                </a>
              </div>
            </article>

            <article className="article-card">
              <div className="article-image">
                <img
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
                  alt="Exploring the Lore of Eldoria"
                  loading="lazy"
                />
              </div>
              <div className="article-content">
                <h3 className="article-title">
                  Exploring the Lore of 'Eldoria'
                </h3>
                <p className="article-excerpt">
                  Delve into the rich and complex world of 'Eldoria', uncovering
                  its history, characters, and hidden secrets.
                </p>
                <a href="/articles/eldoria-lore" className="article-link">
                  Read more
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="category-section">
        <div className="container">
          <h2 className="section-title">Latest in Technology</h2>
          <div className="articles-grid">
            <article className="article-card">
              <div className="article-image">
                <img
                  src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
                  alt="The Rise of Quantum Computing"
                  loading="lazy"
                />
              </div>
              <div className="article-content">
                <h3 className="article-title">The Rise of Quantum Computing</h3>
                <p className="article-excerpt">
                  Quantum computing promises to revolutionize various
                  industries. Learn about its potential and current
                  developments.
                </p>
                <a href="/articles/quantum-computing" className="article-link">
                  Read more
                </a>
              </div>
            </article>

            <article className="article-card">
              <div className="article-image">
                <img
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
                  alt="Cybersecurity in the Digital Age"
                  loading="lazy"
                />
              </div>
              <div className="article-content">
                <h3 className="article-title">
                  Cybersecurity in the Digital Age
                </h3>
                <p className="article-excerpt">
                  Protecting your data is more critical than ever. This article
                  covers essential cybersecurity practices and tools.
                </p>
                <a href="/articles/cybersecurity" className="article-link">
                  Read more
                </a>
              </div>
            </article>

            <article className="article-card">
              <div className="article-image">
                <img
                  src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
                  alt="TechPro X1000 Laptop Review"
                  loading="lazy"
                />
              </div>
              <div className="article-content">
                <h3 className="article-title">
                  Review: The New 'TechPro X1000' Laptop
                </h3>
                <p className="article-excerpt">
                  Our detailed review of the 'TechPro X1000' laptop,
                  highlighting its features, performance, and value.
                </p>
                <a href="/articles/techpro-review" className="article-link">
                  Read more
                </a>
              </div>
            </article>

            <article className="article-card">
              <div className="article-image">
                <img
                  src="https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
                  alt="The Impact of 5G"
                  loading="lazy"
                />
              </div>
              <div className="article-content">
                <h3 className="article-title">
                  The Impact of 5G on Mobile Technology
                </h3>
                <p className="article-excerpt">
                  5G technology is transforming mobile connectivity. Explore its
                  benefits and the future of mobile devices.
                </p>
                <a href="/articles/5g-impact" className="article-link">
                  Read more
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Gaming Section */}
      <section className="category-section">
        <div className="container">
          <h2 className="section-title">Latest in Games</h2>
          <div className="articles-grid">
            <article className="article-card">
              <div className="article-image">
                <img
                  src="https://images.unsplash.com/photo-1542751110-97427bbecf20?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
                  alt="Galactic Wars: Legacy"
                  loading="lazy"
                />
              </div>
              <div className="article-content">
                <h3 className="article-title">
                  'Galactic Wars: Legacy' - A Deep Dive
                </h3>
                <p className="article-excerpt">
                  Explore the immersive world of 'Galactic Wars: Legacy', its
                  gameplay, and its impact on the gaming community.
                </p>
                <a href="/articles/galactic-wars" className="article-link">
                  Read more
                </a>
              </div>
            </article>

            <article className="article-card">
              <div className="article-image">
                <img
                  src="https://plus.unsplash.com/premium_photo-1683141331949-64810cfc4ca3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZXNwb3J0c3xlbnwwfHwwfHx8MA%3D%3D"
                  alt="The Evolution of Esports"
                  loading="lazy"
                />
              </div>
              <div className="article-content">
                <h3 className="article-title">The Evolution of Esports</h3>
                <p className="article-excerpt">
                  Esports has grown into a global phenomenon. This article
                  examines its rise and future prospects.
                </p>
                <a href="/articles/esports-evolution" className="article-link">
                  Read more
                </a>
              </div>
            </article>

            <article className="article-card">
              <div className="article-image">
                <img
                  src="https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
                  alt="Mystic Realms"
                  loading="lazy"
                />
              </div>
              <div className="article-content">
                <h3 className="article-title">
                  Indie Games Spotlight: 'Mystic Realms'
                </h3>
                <p className="article-excerpt">
                  Discover the charming and engaging indie game 'Mystic Realms',
                  a hidden gem in the gaming world.
                </p>
                <a href="/articles/mystic-realms" className="article-link">
                  Read more
                </a>
              </div>
            </article>

            <article className="article-card">
              <div className="article-image">
                <img
                  src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
                  alt="Virtual Reality Gaming"
                  loading="lazy"
                />
              </div>
              <div className="article-content">
                <h3 className="article-title">
                  Gaming Trends: Virtual Reality and Beyond
                </h3>
                <p className="article-excerpt">
                  Virtual reality is changing how we experience games. Learn
                  about the latest VR technologies and their potential.
                </p>
                <a href="/articles/vr-gaming" className="article-link">
                  Read more
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay Updated with Looma</h2>
            <p>
              Subscribe to our newsletter for the latest articles on technology
              and gaming.
            </p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo-container">
                <img
                  src="/looma-logo-white.png"
                  style={{ width: "140px" }}
                  alt="Looma Logo"
                />
              </div>
              <p>
                Your premier destination for technology and gaming insights,
                reviews, and news.
              </p>
              <p className="company-credit">
                Supported by <strong>Refora Technologies</strong>
              </p>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h3>Categories</h3>
                <a href="/technology">Technology</a>
                <a href="/games">Games</a>
                <a href="/reviews">Reviews</a>
                <a href="/guides">Guides</a>
              </div>

              <div className="footer-column">
                <h3>Company</h3>
                <a href="/about">About Us</a>
                <a href="/contact">Contact</a>
                <a href="/careers">Careers</a>
                <a href="/privacy">Privacy Policy</a>
              </div>

              <div className="footer-column">
                <h3>Connect</h3>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Twitter
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              &copy; 2025 Looma. All rights reserved. A Refora Technologies
              initiative.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
