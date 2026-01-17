import React from 'react'
import card1 from '../assets/track.png'
import card2 from '../assets/op.png'
import card3 from '../assets/team.png'
import card4 from '../assets/track-task.png'
import card5 from '../assets/descion.png'
import Image from 'next/image'

const cardData = [
    {
        id: 1,
        title: "Stay on Top of Your Finances",
        description: "Track sales, manage expenses, and monitor profits in real-time",
        image: card1,
    },
    {
        id: 2,
        title: "Run Your Operations Smoothly",
        description: "No back-and-forth emails - our accountants file your taxes",
        image: card2,
    },
    {
        id: 3,
        title: "Empower Your Team with Smart HR",
        description: "Employee records, attendance, payroll, leave requests, and benefits in one place.",
        image: card3,
    },
    {
        id: 4,
        title: "Keep Every Task on Track",
        description: "Assign tasks, track deadlines, and monitor employee progress.",
        image: card4,
    },
    {
        id: 5,
        title: "Make Data-Driven Decisions",
        description: "Interactive dashboards, profit/loss summaries, HR insights, and exportable reports.",
        image: card5,
    },
];




function ServiceCard() {
    return (
        <section className="px-6 py-12 font-poppins">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 ">

                {cardData.map((card) => (
                    <div
                        key={card.id}
                        className="
             group
  flex flex-col justify-between
  bg-white rounded-xl border border-gray-200 p-6
  shadow-sm
  transition-all duration-300 ease-out
  hover:-translate-y-2
  hover:shadow-xl
  hover:border-[rgb(var(--primary))]
            "
                    >
                        {/* Text */}
                        <div>
                            <h3 className="text-lg font-semibold mb-2 ransition-colors duration-300
  group-hover:text-[rgb(var(--primary))]">
                                {card.title}
                            </h3>

                            <p className="text-gray-600 text-sm">
                                {card.description}
                            </p>
                        </div>

                        {/* Image at bottom */}
                        <div className="relative mt-6 h-40 w-full">
                            <Image
                                src={card.image}
                                alt={card.title}
                                fill
                                className="object-contain 
                transition-transform duration-300 ease-out
                group-hover:scale-105"
                            />
                        </div>
                    </div>
                ))}

            </div>
        </section>
    );
}

export default ServiceCard;


