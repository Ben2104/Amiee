"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { hasWebGL } from "@/lib/webgl";

const DioramaScene = dynamic(() => import("./DioramaScene").then((m) => m.DioramaScene), { ssr: false });

export function DioramaSection() {
  const [webglOk, setWebglOk] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglOk(hasWebGL());
  }, []);

  if (webglOk === null) return null;

  return (
    <section className="relative h-[150vh] w-full bg-[#0B0608]">
      <div className="sticky top-0 h-screen w-full">
        {webglOk ? (
          <DioramaScene />
        ) : (
          <img
            src="/diorama-fallback.png"
            alt="Illustrated view of the café diorama"
            className="h-full w-full object-cover"
          />
        )}
      </div>
    </section>
  );
}
