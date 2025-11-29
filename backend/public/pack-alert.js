console.log("FrogTCG pack alert loaded");

// SFX helpers
function playSfx(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.currentTime = 0;
  el.volume = 0.9;
  el.play().catch(() => {});
}

window.runPackAnimation = function (data) {
  console.log("🔥 runPackAnimation payload:", data);

  const scene = document.getElementById("pack-scene");
  const packWrapper = document.getElementById("pack-wrapper");
  const packBase = document.getElementById("pack-base");
  const packFlap = document.getElementById("pack-flap");
  const cardWrapper = document.getElementById("card-wrapper");
  const cardImg = document.getElementById("card-img");
  const flash = document.getElementById("flash");
  const sparksContainer = document.getElementById("sparks-container");
  const sparks = sparksContainer
    ? Array.from(sparksContainer.querySelectorAll(".spark"))
    : [];

  const labelUser = document.getElementById("label-user");
  const labelCard = document.getElementById("label-card");
  const labelRarity = document.getElementById("label-rarity");

  if (!packWrapper || !packBase || !packFlap || !cardWrapper || !cardImg) {
    console.error("❌ Missing DOM elements for pack alert overlay.");
    return;
  }

  // Label text
  labelUser.textContent = data?.user ? `${data.user} opened a pack!` : "";
  labelCard.textContent = data?.card?.name || "";
  labelRarity.textContent = data?.rarity || "";

  // FRONT art (from payload) & BACK art (generic card back)
  const frontSrc = data?.card?.imageUrl || "/placeholder-card.png";
  const backSrc = "/placeholder-card-back.png"; // create this asset; fallback below

  // Start with BACK showing (if back asset exists)
  cardImg.src = backSrc;
  cardImg.onerror = () => {
    // fallback if back image missing
    cardImg.src = "/placeholder-card.png";
  };

  // Reset transforms
  gsap.killTweensOf([scene, packWrapper, packBase, packFlap, cardWrapper, cardImg, flash, ...sparks]);
  gsap.set(scene, { opacity: 1 });

  gsap.set(packWrapper, {
    xPercent: -50,
    yPercent: -50,
    scale: 0.2,
    rotationY: -180,
    rotationX: 0,
    opacity: 0,
    transformPerspective: 800,
    transformStyle: "preserve-3d"
  });

  gsap.set(packBase, {
    rotationX: 0,
    rotationY: 0,
  });

  gsap.set(packFlap, {
    opacity: 0,
    rotationX: 0,
    rotationY: 0,
    y: 0
  });

  gsap.set(cardWrapper, {
    xPercent: -50,
    yPercent: -50,
    y: 80,
    opacity: 0,
    rotationY: 0,
    rotationX: 0,
    scale: 0.7,
    transformPerspective: 800,
    transformStyle: "preserve-3d"
  });

  gsap.set(cardImg, {
    rotationY: 0,
    backfaceVisibility: "hidden"
  });

  gsap.set(flash, { opacity: 0, scale: 0.8 });

  sparks.forEach((s) => {
    gsap.set(s, {
      opacity: 0,
      x: 0,
      y: 0,
      scale: gsap.utils.random(0.8, 1.2)
    });
  });

  let flippedToFront = false;

  const tl = gsap.timeline();

  // 1️⃣ CINEMATIC PACK ENTRY: slow zoom with 3D 360 on Y
  tl.to(packWrapper, {
    duration: 2.0,        // S2 (dramatic slow)
    scale: 1.05,
    rotationY: 360,
    opacity: 1,
    ease: "power3.out"
  });

  // Smooth straighten & settle
  tl.to(packWrapper, {
    duration: 0.5,
    rotationY: 0,
    scale: 1.0,
    ease: "power2.out"
  }, "-=0.3");

  // 2️⃣ REAL TEAR: top flap separates, base stays missing top
  tl.add(() => {
    playSfx("sfx-rip");
  }, "+=0.05");

  // Flash & start showing flap
  tl.to(flash, {
    duration: 0.1,
    opacity: 1,
    scale: 1.1,
    ease: "power2.out"
  }, "-=0.05").to(flash, {
    duration: 0.25,
    opacity: 0,
    scale: 1.4,
    ease: "power2.in"
  }, "-=0.05");

  // Reveal flap at the top
  tl.to(packFlap, {
    duration: 0.05,
    opacity: 1
  }, "-=0.15");

  // Bend flap backward (like foil being ripped)
  tl.to(packFlap, {
    duration: 0.25,
    rotationX: -130,
    ease: "power1.in"
  }, "-=0.1");

  // Flap flies upward and off to the side
  tl.to(packFlap, {
    duration: 0.6,
    y: -180,
    rotationY: -20,
    rotationX: -160,
    opacity: 0,
    ease: "power2.in"
  }, "-=0.02");

  // Small pack squash during tear for impact
  tl.to(packWrapper, {
    duration: 0.15,
    scaleY: 0.94
  }, "-=0.4").to(packWrapper, {
    duration: 0.2,
    scaleY: 1.0
  }, "-=0.25");

  // Simple sparks from tear line
  tl.add(() => {
    sparks.forEach((s) => {
      const angle = gsap.utils.random(-80, 80);
      const dist = gsap.utils.random(60, 130);
      const dur = gsap.utils.random(0.3, 0.7);
      gsap.fromTo(s,
        {
          opacity: 1,
          x: 0,
          y: 0
        },
        {
          opacity: 0,
          x: Math.cos(angle * Math.PI / 180) * dist,
          y: Math.sin(angle * Math.PI / 180) * dist,
          duration: dur,
          ease: "power1.out"
        }
      );
    });
  }, "-=0.25");

  // Wait a beat before card reveal (anticipation)
  tl.to({}, { duration: 0.4 });

  // 3️⃣ CARD RISES SHOWING BACK, THEN FLIPS TO FRONT
  tl.add(() => {
    playSfx("sfx-reveal");
  }, "+=0.05");

  // Card rises from inside pack (back showing)
  tl.to(cardWrapper, {
    duration: 0.7,
    opacity: 1,
    y: -80,
    ease: "power2.out"
  }, "-=0.05");

  // Flip in 3D: show back -> rotate -> show front mid-flip
  tl.to(cardWrapper, {
    duration: 0.7,
    rotationY: 180,
    ease: "power2.inOut",
    onUpdate: function () {
      if (!flippedToFront && this.progress() > 0.5) {
        flippedToFront = true;
        cardImg.src = frontSrc;  // switch to front art mid-flip
      }
    }
  }, "-=0.4");

  // Card settles forward over pack, slightly bigger to cover it
  tl.to(cardWrapper, {
    duration: 0.6,
    y: -30,
    scale: 1.1,
    ease: "power3.out"
  }, "-=0.2");

  // Pack subtly recedes
  tl.to(packWrapper, {
    duration: 0.5,
    scale: 0.95,
    ease: "power1.out"
  }, "<");

  // 4️⃣ OUTRO: zoom/fade both away
  tl.to([cardWrapper, packWrapper], {
    duration: 0.8,
    scale: 0.5,
    y: "+=140",
    opacity: 0,
    ease: "power2.in"
  }, "+=0.7");

  tl.to(scene, {
    duration: 0.3,
    opacity: 0,
    ease: "power1.in",
    onComplete: () => {
      gsap.set(scene, { opacity: 1 });
      gsap.set([packWrapper, cardWrapper, packFlap], { opacity: 0 });
    }
  }, "-=0.2");
};
