import React from 'react';
import { motion } from 'framer-motion';

const ScrollReveal = ({ children, width = "fit-content", delay = 0 }) => {
    return (
        <div style={{ width, overflow: "hidden" }}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 }
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: delay, type: "spring", bounce: 0.3 }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default ScrollReveal;
