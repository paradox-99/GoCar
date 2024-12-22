export function generateAgencyId() {
     const prefix = "USER-";
     for (let index = 0; index < 50; index++) {
          const uniqueNumber = Date.now() + Math.floor(Math.random() * 1000); // ensures uniqueness
          console.log(`${prefix}${uniqueNumber}`);
     }
}

generateAgencyId();