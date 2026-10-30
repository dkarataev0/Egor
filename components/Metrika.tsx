import Script from "next/script";

// Подключается только если задан NEXT_PUBLIC_YM_ID. Цель «Отправка заявки»: lead_submit (lib/analytics.ts).
export default function Metrika() {
  const id = process.env.NEXT_PUBLIC_YM_ID;
  if (!id || !/^\d+$/.test(id)) return null;
  return (
    <>
      <Script id="ym" strategy="afterInteractive">{`
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
        ym(${id}, "init", {clickmap:true, trackLinks:true, accurateTrackBounce:true, webvisor:false});
      `}</Script>
      <noscript><div><img src={`https://mc.yandex.ru/watch/${id}`} style={{ position: "absolute", left: "-9999px" }} alt="" /></div></noscript>
    </>
  );
}
