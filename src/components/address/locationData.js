import toyoto_car from "/src/assets/topBrands/toyoto_car.png"
import toyoto_logo from "/src/assets/topBrands/toyoto_logo.png"
import honda_car from "/src/assets/topBrands/honda_car.png"
import honda_logo from "/src/assets/topBrands/honda_logo.png"
import nissan_car from "/src/assets/topBrands/nissan_car.png"
import nissan_logo from "/src/assets/topBrands/nissan_logo.png"
import suzuki_car from "/src/assets/topBrands/suzuki_car.png"
import suzuki_logo from "/src/assets/topBrands/suzuki_logo.png"
import Mitsubishi from "/src/assets/topBrands/Mitsubishi.png"
import kia from "/src/assets/topBrands/kia.png"
import hyundai from "/src/assets/topBrands/hyundai.png"
import volkswagan from "/src/assets/topBrands/Volkswagen.png"
import tata from "/src/assets/topBrands/tata.png"
import sedan from "/src/assets/topBrands/sedan.png"
import hatchback from "/src/assets/topBrands/hatchback.png"
import van from "/src/assets/topBrands/van.png"
import minivan from "/src/assets/topBrands/minivan.png"

export const locationData =
{
    "Dhaka": {
        "Dhaka": ["Dhaka North", "Dhaka South", "Dhamrai", "Dohar", "Keraniganj", "Nawabganj", "Savar"],
        "Faridpur": ["Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Faridpur Sadar", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"],
        "Gazipur": ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"],
        "Gopalganj": ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"],
        "Kishoreganj": ["Austagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna", "Karimganj", "Katiadi", "Kuliarchar", "Kishoreganj Sadar", "Mithamain", "Nikli", "Pakundia", "Tarail"],
        "Madaripur": ["Kalkini", "Madaripur Sadar", "Rajoir", "Shibchar"],
        "Manikganj": ["Daulatpur", "Ghior", "Harirampur", "Manikganj Sadar", "Saturia", "Shivalaya", "Singair"],
        "Munshiganj": ["Gazaria", "Lohajang", "Munshiganj Sadar", "Sirajdikhan", "Sreenagar", "Tongibari"],
        "Narayanganj": ["Araihazar", "Bandar", "Narayanganj Sadar", "Rupganj", "Sonargaon"],
        "Narsingdi": ["Belabo", "Monohardi", "Narsingdi Sadar", "Palash", "Raipura", "Shibpur"],
        "Rajbari": ["Baliakandi", "Goalandaghat", "Pangsha", "Rajbari Sadar", "Kalukhali"],
        "Shariatpur": ["Bhedarganj", "Damudya", "Gosairhat", "Naria", "Shariatpur Sadar", "Zanjira"],
        "Tangail": ["Basail", "Bhuapur", "Delduar", "Dhanbari", "Ghatail", "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur", "Tangail Sadar"]
    },
    "Rajshahi": {
        "Bogura": ["Adamdighi", "Dhunat", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatala", "Bogura Sadar"],
        "Joypurhat": ["Akkelpur", "Joypurhat Sadar", "Kalai", "Khetlal", "Panchbibi"],
        "Naogaon": ["Atrai", "Badalgachhi", "Manda", "Dhamoirhat", "Mohadevpur", "Naogaon Sadar", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"],
        "Natore": ["Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Natore Sadar", "Singra"],
        "Chapainawabganj": ["Bholahat", "Gomastapur", "Nachole", "Shibganj", "Chapainawabganj Sadar"],
        "Pabna": ["Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Pabna Sadar", "Santhia", "Sujanagar"],
        "Rajshahi": ["Bagha", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba", "Puthia", "Rajshahi Sadar", "Tanore"],
        "Sirajganj": ["Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur", "Sirajganj Sadar", "Tarash", "Ullahpara"]
    },
    "Rangpur": {
        "Dinajpur": ["Birampur", "Birganj", "Biral", "Bochaganj", "Chirirbandar", "Dinajpur Sadar", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"],
        "Gaibandha": ["Fulchhari", "Gaibandha Sadar", "Gobindaganj", "Palashbari", "Sadullapur", "Saghata", "Sundarganj"],
        "Kurigram": ["Bhurungamari", "Char Rajibpur", "Chilmari", "Kurigram Sadar", "Nageshwari", "Phulbari", "Rajarhat", "Rowmari", "Ulipur"],
        "Lalmonirhat": ["Aditmari", "Hatibandha", "Kaliganj", "Lalmonirhat Sadar", "Patgram"],
        "Nilphamari": ["Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Nilphamari Sadar", "Saidpur"],
        "Panchagarh": ["Atwari", "Boda", "Debiganj", "Panchagarh Sadar", "Tetulia"],
        "Rangpur": ["Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Rangpur Sadar", "Taraganj"],
        "Thakurgaon": ["Baliadangi", "Haripur", "Pirganj", "Ranisankail", "Thakurgaon Sadar"]
    },
    "Chattogram": {
        "Bandarban": ["Bandarban Sadar", "Thanchi", "Lama", "Ruma", "Rowangchhari", "Ali Kadam", "Naikhongchhari"],
        "Brahmanbaria": ["Brahmanbaria Sadar", "Ashuganj", "Bancharampur", "Nabinagar", "Nasirnagar", "Sarail", "Kasba", "Akhaura"],
        "Chandpur": ["Chandpur Sadar", "Faridganj", "Haimchar", "Haziganj", "Kachua", "Matlab Dakshin", "Matlab Uttar", "Shahrasti"],
        "Chattogram": ["Anwara", "Banshkhali", "Boalkhali", "Chandanaish", "Chattogram Sadar", "Fatikchhari", "Hathazari", "Lohagara", "Mirsharai", "Patiya", "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda"],
        "Cox's Bazar": ["Chakaria", "Cox's Bazar Sadar", "Kutubdia", "Maheshkhali", "Pekua", "Ramu", "Teknaf", "Ukhia"],
        "Cumilla": ["Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Cumilla Sadar", "Cumilla Sadar Dakshin", "Daudkandi", "Debidwar", "Homna", "Laksam", "Meghna", "Monohorgonj", "Muradnagar", "Nangalkot", "Titas"],
        "Feni": ["Chhagalnaiya", "Daganbhuiyan", "Feni Sadar", "Fulgazi", "Parshuram", "Sonagazi"],
        "Khagrachari": ["Dighinala", "Khagrachari Sadar", "Lakshmichhari", "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh"],
        "Lakshmipur": ["Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati", "Kamalnagar"],
        "Noakhali": ["Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Kabirhat", "Noakhali Sadar", "Senbagh", "Sonaimuri", "Subarnachar"],
        "Rangamati": ["Baghaichhari", "Barkal", "Juraichhari", "Kaptai", "Kawkhali", "Langadu", "Nannerchar", "Rajasthali", "Rangamati Sadar"]
    },
    "Sylhet": {
        "Habiganj": ["Ajmiriganj", "Bahubal", "Baniachong", "Chunarughat", "Habiganj Sadar", "Lakhai", "Madhabpur", "Nabiganj"],
        "Moulvibazar": ["Barlekha", "Juri", "Kamalganj", "Kulaura", "Moulvibazar Sadar", "Rajnagar", "Sreemangal"],
        "Sunamganj": ["Bishwamvarpur", "Chhatak", "Derai", "Dharampasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sullah", "Sunamganj Sadar", "Shantiganj", "Tahirpur"],
        "Sylhet": ["Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Dakshin Surma", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Osmani Nagar", "Sylhet Sadar"]
    },
    "Khulna": {
        "Bagerhat": ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"],
        "Chuadanga": ["Alamdanga", "Chuadanga Sadar", "Damurhuda", "Jibannagar"],
        "Jashore": ["Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Jashore Sadar", "Manirampur", "Sharsha"],
        "Jhenaidah": ["Harinakunda", "Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa"],
        "Khulna": ["Batiaghata", "Dacope", "Dumuria", "Dighalia", "Koyra", "Paikgachha", "Phultala", "Rupsha", "Terokhada", "Khulna Sadar"],
        "Kushtia": ["Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Kushtia Sadar", "Mirpur"],
        "Magura": ["Magura Sadar", "Mohammadpur", "Shalikha", "Sreepur"],
        "Meherpur": ["Gangni", "Meherpur Sadar", "Mujibnagar"],
        "Narail": ["Kalia", "Lohagara", "Narail Sadar"],
        "Satkhira": ["Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Satkhira Sadar", "Shyamnagar", "Tala"]
    },
    "Barisal": {
        "Barguna": ["Amtali", "Bamna", "Barguna Sadar", "Betagi", "Patharghata", "Taltali"],
        "Barisal": ["Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Barisal Sadar", "Gournadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur"],
        "Bhola": ["Bhola Sadar", "Burhanuddin", "Char Fasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"],
        "Jhalokathi": ["Jhalokathi Sadar", "Kathalia", "Nalchity", "Rajapur"],
        "Patuakhali": ["Bauphal", "Dashmina", "Galachipa", "Kalapara", "Mirzaganj", "Patuakhali Sadar", "Dumki", "Rangabali"],
        "Pirojpur": ["Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Pirojpur Sadar", "Zianagar"]
    },
    "Mymensingh": {
        "Jamalpur": ["Baksiganj", "Dewanganj", "Islampur", "Jamalpur Sadar", "Madarganj", "Melandaha", "Sarishabari"],
        "Mymensingh": ["Bhaluka", "Dhobaura", "Fulbaria", "Gaffargaon", "Gouripur", "Haluaghat", "Ishwarganj", "Mymensingh Sadar", "Muktagachha", "Nandail", "Phulpur", "Trishal"],
        "Netrokona": ["Atpara", "Barhatta", "Durgapur", "Khaliajuri", "Kalmakanda", "Kendua", "Madan", "Mohanganj", "Netrokona Sadar", "Purbadhala"],
        "Sherpur": ["Jhenaigati", "Nakla", "Nalitabari", "Sherpur Sadar", "Sreebardi"]
    }
}

export const keyArea = {
    "Dhaka North": [
        "Uttara",
        "Mirpur",
        "Gulshan",
        "Banani",
        "Baridhara",
        "Mohakhali",
        "Bashundhara",
        "Badda",
        "Khilkhet",
        "Pallabi",
        "Tejgaon",
        "Kafrul",
        "Kalachandpur"
    ],
    "Dhaka South": [
        "Dhanmondi",
        "Jatrabari",
        "Motijheel",
        "Lalbagh",
        "Azimpur",
        "Paltan",
        "Khilgaon",
        "Wari",
        "Gendaria",
        "Shahbagh",
        "Sutrapur",
        "Hazaribagh",
        "New Market"
    ]
}

export const district = [
    { label: "Bagerhat" },
    { label: "Bandarban" },
    { label: "Barguna" },
    { label: "Barishal" },
    { label: "Bhola" },
    { label: "Bogura" },
    { label: "Brahmanbaria" },
    { label: "Chandpur" },
    { label: "Chattogram" },
    { label: "Chuadanga" },
    { label: "Cox's Bazar" },
    { label: "Cumilla" },
    { label: "Dhaka" },
    { label: "Dinajpur" },
    { label: "Faridpur" },
    { label: "Feni" },
    { label: "Gaibandha" },
    { label: "Gazipur" },
    { label: "Gopalganj" },
    { label: "Habiganj" },
    { label: "Jamalpur" },
    { label: "Jashore" },
    { label: "Jhalokathi" },
    { label: "Jhenaidah" },
    { label: "Joypurhat" },
    { label: "Khagrachari" },
    { label: "Khulna" },
    { label: "Kishoreganj" },
    { label: "Kurigram" },
    { label: "Kushtia" },
    { label: "Lakshmipur" },
    { label: "Lalmonirhat" },
    { label: "Madaripur" },
    { label: "Magura" },
    { label: "Manikganj" },
    { label: "Meherpur" },
    { label: "Moulvibazar" },
    { label: "Munshiganj" },
    { label: "Mymensingh" },
    { label: "Naogaon" },
    { label: "Narail" },
    { label: "Narayanganj" },
    { label: "Narsingdi" },
    { label: "Natore" },
    { label: "Netrokona" },
    { label: "Nilphamari" },
    { label: "Noakhali" },
    { label: "Pabna" },
    { label: "Panchagarh" },
    { label: "Patuakhali" },
    { label: "Pirojpur" },
    { label: "Rajbari" },
    { label: "Rajshahi" },
    { label: "Rangamati" },
    { label: "Rangpur" },
    { label: "Satkhira" },
    { label: "Shariatpur" },
    { label: "Sherpur" },
    { label: "Sirajganj" },
    { label: "Sunamganj" },
    { label: "Sylhet" },
    { label: "Tangail" },
    { label: "Thakurgaon" }
];

export const upazillas = [
    { label: "Dhaka North" },
    { label: "Dhaka South" },
    { label: "Adamdighi" },
    { label: "Ajmiriganj" },
    { label: "Akhaura" },
    { label: "Alamdanga" },
    { label: "Amtali" },
    { label: "Ashuganj" },
    { label: "Atpara" },
    { label: "Austagram" },
    { label: "Bagatipara" },
    { label: "Bagha" },
    { label: "Bajitpur" },
    { label: "Bamna" },
    { label: "Banaripara" },
    { label: "Bandarban Sadar" },
    { label: "Bancharampur" },
    { label: "Banshkhali" },
    { label: "Baraigram" },
    { label: "Barisal Sadar" },
    { label: "Begumganj" },
    { label: "Bhairab" },
    { label: "Bhola Sadar" },
    { label: "Bholahat" },
    { label: "Bhuapur" },
    { label: "Bhurungamari" },
    { label: "Bishwanath" },
    { label: "Boalkhali" },
    { label: "Borhanuddin" },
    { label: "Burichang" },
    { label: "Chakaria" },
    { label: "Chhatak" },
    { label: "Chatmohar" },
    { label: "Chhagalnaiya" },
    { label: "Chirirbandar" },
    { label: "Comilla Sadar" },
    { label: "Dacope" },
    { label: "Daudkandi" },
    { label: "Debidwar" },
    { label: "Debiganj" },
    { label: "Dewanganj" },
    { label: "Dinajpur Sadar" },
    { label: "Dohar" },
    { label: "Faridganj" },
    { label: "Fatikchhari" },
    { label: "Feni Sadar" },
    { label: "Gaibandha Sadar" },
    { label: "Ghoraghat" },
    { label: "Gopalganj Sadar" },
    { label: "Gosairhat" },
    { label: "Habiganj Sadar" },
    { label: "Hathazari" },
    { label: "Hizla" },
    { label: "Ishwarganj" },
    { label: "Jamalpur Sadar" },
    { label: "Jessore Sadar" },
    { label: "Jhalokathi Sadar" },
    { label: "Jibannagar" },
    { label: "Kabirhat" },
    { label: "Kachua" },
    { label: "Kahaloo" },
    { label: "Kalapara" },
    { label: "Kamalganj" },
    { label: "Kapasia" },
    { label: "Karimganj" },
    { label: "Kasba" },
    { label: "Kendua" },
    { label: "Khagrachhari Sadar" },
    { label: "Kishoreganj Sadar" },
    { label: "Kurigram Sadar" },
    { label: "Lakshmipur Sadar" },
    { label: "Lalmonirhat Sadar" },
    { label: "Madaripur Sadar" },
    { label: "Magura Sadar" },
    { label: "Manikganj Sadar" },
    { label: "Mathbaria" },
    { label: "Mithapukur" },
    { label: "Mohanganj" },
    { label: "Moulvibazar Sadar" },
    { label: "Muktagachha" },
    { label: "Munshiganj Sadar" },
    { label: "Mymensingh Sadar" },
    { label: "Nabiganj" },
    { label: "Naogaon Sadar" },
    { label: "Narail Sadar" },
    { label: "Narsingdi Sadar" },
    { label: "Natore Sadar" },
    { label: "Netrokona Sadar" },
    { label: "Nilphamari Sadar" },
    { label: "Noakhali Sadar" },
    { label: "Pabna Sadar" },
    { label: "Panchagarh Sadar" },
    { label: "Patgram" },
    { label: "Rajbari Sadar" },
    { label: "Rangpur Sadar" },
    { label: "Rupsha" },
    { label: "Sandwip" },
    { label: "Satkhira Sadar" },
    { label: "Shariatpur Sadar" },
    { label: "Sherpur Sadar" },
    { label: "Sirajganj Sadar" },
    { label: "Sonargaon" },
    { label: "Sunamganj Sadar" },
    { label: "Sylhet Sadar" },
    { label: "Tangail Sadar" },
    { label: "Thakurgaon Sadar" }
];

export const carBrands = [
    { label: "Toyota" },
    { label: "Nissan" },
    { label: "Mitsubishi" },
    { label: "Hyundai" },
    { label: "Honda" },
    { label: "Suzuki" },
    { label: "Tata" },
    { label: "Kia" },
    { label: "Volkswagen" }
];

export const top_brands = [
    {
        name: "Toyota",
        image: toyoto_car,
        logo: toyoto_logo
    },
    {
        name: "Honda",
        image: honda_car,
        logo: honda_logo
    },
    {
        name: "Nissan",
        image: nissan_car,
        logo: nissan_logo
    },
    {
        name: "Suzuki",
        image: suzuki_car,
        logo: suzuki_logo
    }
]

export const all_brands = [
    {
        name: "Toyota",
        image: toyoto_car
    },
    {
        name: "Honda",
        image: honda_car
    },
    {
        name: "Nissan",
        image: nissan_car
    },
    {
        name: "Suzuki",
        image: suzuki_car
    },
    {
        name: "Mitsubishi",
        image: Mitsubishi
    },
    {
        name: "Kia",
        image: kia
    },
    {
        name: "Hyundai",
        image: hyundai
    },
    {
        name: "Volkswagen",
        image: volkswagan
    },
    {
        name: "Tata",
        image: tata
    }
]

export const top_car_types = [
    {
        name: "Sedan",
        image: sedan
    },
    {
        name: "Hatchback",
        image: hatchback
    },
    {
        name: "Van",
        image: van
    },
    {
        name: "Minivan",
        image: minivan
    }
]

export const car_types = [
    { label: "Sedan" },
    { label: "Hatchback" },
    { label: "Van" },
    { label: "Minivan" }
]