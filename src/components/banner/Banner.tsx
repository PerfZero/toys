import React from "react";
import "./Banner.css";
import bannerImg from "@/img/banner.jpg";

function Banner() {
  return (
    <div className="banner">
      <img src={bannerImg.src} alt={""} />
    </div>
  );
}

export default Banner;
