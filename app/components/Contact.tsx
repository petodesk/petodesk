'use client'

import { FaWhatsapp, FaPhoneAlt, FaClock } from 'react-icons/fa'

export default function Contact() {
    return (
        <section className="w-full bg-[#FAFAFA] py-26 px-4 font-poppins">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">Get in Touch</h2>
                    <p className="text-gray-700 mt-2 text-md">
                        Have questions? <br />We’d love to hear from you. Send us a message
                        <br className="hidden sm:block" />
                        and our team will respond as soon as possible.
                    </p>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Card */}
                    <div className="bg-blue-600 text-white max-w-100 rounded-xl p-6 flex flex-col justify-between">
                        <div className='flex flex-col gap-3 '>
                            <h3 className="text-3xl font-bold mb-2">
                                Let’s Start a Conversation
                            </h3>
                            <p className="text-md text-blue-100 mb-6">
                                Reach out to us through any of the channels below.
                                We’re here to help.
                            </p>

                            <ul className="space-y-8 text-sm">
                                <li className="flex items-center gap-3 ">
                                    <FaWhatsapp className="rounded-lg p-2 bg-[#719AF2] size-8 md:size-10"  />
                                    <span>WhatsApp<br />+234 555 5169</span>
                                </li>

                                <li className="flex items-center gap-3">
                                    <FaPhoneAlt className="rounded-lg p-2 bg-[#719AF2] size-8 md:size-10" />
                                    <span>Call<br />+234 704 560 1723</span>
                                </li>

                                <li className="flex items-center gap-3">
                                    <FaClock className="rounded-lg p-2 bg-[#719AF2] size-8 md:size-10"/>
                                    <span>Support Hours<br />Mon – Fri, 8am – 5pm</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Form */}
                    <div className="md:col-span-2 bg-white rounded-xl shadow-md  p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Send us a Message
                        </h3>
                        <p className="text-md font-semibold text-gray-500 mb-6">
                            Fill out the form below and our team will respond within 24 hours.
                        </p>

                        <form className="space-y-6">
                            <div className="flex flex-col gap-2 md:gap-10 md:flex-row justify-between">

                                <input
                                    type="text"
                                    placeholder="Your Name *"
                                    className=" rounded-lg w-full border border-gray-500 p-2"
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address *"
                                    className=" rounded-lg w-full border border-gray-500 p-2"
                                />
                            </div>
                            <div className='flex flex-col gap-6'>
                                <input
                                    type="text"
                                    placeholder="Subject *"
                                   
                                     className=" rounded-lg w-full border border-gray-500 p-2"
                                />

                                <textarea
                                    rows={4}
                                    placeholder="Message *"
                                  className=" rounded-lg w-full border border-gray-500 p-2"
                                />
                            </div>


                            <button
                                type="submit"
                                className="w-full btn-primary text-white py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                            >
                                Create Account
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}
