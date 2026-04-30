"use client";

export default function Dashboard(props: any) {

  const metrics =
    props?.metrics || [];

  return (

    <div>

      <h1 className="
        text-3xl
        font-bold
        mb-8
      ">
        Dashboard
      </h1>

      <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-4
        gap-6
      ">

        {metrics.map(
          (
            metric: any,
            index: number
          ) => (

            <div
              key={index}
              className="
                bg-white
                rounded-2xl
                shadow-md
                p-6
              "
            >

              <p className="
                text-gray-500
              ">
                {metric.label}
              </p>

              <h2 className="
                text-4xl
                font-bold
                mt-3
              ">
                {metric.value || 0}
              </h2>

            </div>

          )
        )}

      </div>

    </div>
  );
}