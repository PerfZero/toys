import Link from "next/link";
import img from "@/img/404-page-not-found.svg";
import "./not-found.css";

export default function NotFound() {
  return (
    <div className="not-found">
      <img src={img.src} alt="" />
      <h1>Oops... Страница не найдена!</h1>
      <Link href="/">Вернуться на главную</Link>
    </div>
  );
}
