import Image from "next/image";

export default function Home() {
  return (
    <div className="flex items-center justify-center text-center bg-zinc-50 px-6 text-center font-sans min-h-screen">
  <h1 className="max-w-3xl text-2xl font-semibold leading-relaxed text-orange-600">
    Hello Peter 
    <br />
    This is the official project boilerplate.  
    <br />
    We’ll use this URL to deploy all updates and track progress in real time.  
    <br />
    Please check your Vercel dashboard or just use the above url to see every new change as it goes live.
  </h1>
</div>

  );
}
