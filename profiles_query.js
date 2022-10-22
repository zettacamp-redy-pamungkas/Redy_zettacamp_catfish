const firstname = ["Anderson", "Ashwoon", "Aikin", "Bateman", "Bongard", "Bowers", "Boyd", "Cannon", "Cast", "Deitz", "Dewalt", "Ebner", "Frick", "Hancock", "Haworth", "Hesch", "Hoffman", "Kassing", "Knutson", "Lawless", "Lawicki", "Mccord", "McCormack", "Miller", "Myers", "Nugent", "Ortiz", "Orwig", "Ory", "Paiser", "Pak", "Pettigrew", "Quinn", "Quizoz", "Ramachandran", "Resnick", "Sagar", "Schickowski", "Schiebel", "Sellon", "Severson", "Shaffer", "Solberg", "Soloman", "Sonderling", "Soukup", "Soulis", "Stahl", "Sweeney", "Tandy", "Trebil", "Trusela", "Trussel", "Turco", "Uddin", "Uflan", "Ulrich", "Upson", "Vader", "Vail", "Valente", "Van Zandt", "Vanderpoel", "Ventotla", "Vogal", "Wagle", "Wagner", "Wakefield", "Weinstein", "Weiss", "Woo", "Yang", "Yates", "Yocum", "Zeaser", "Zeller", "Ziegler", "Bauer", "Baxster", "Casal", "Cataldi", "Caswell", "Celedon", "Chambers", "Chapman", "Christensen", "Darnell", "Davidson", "Davis", "DeLorenzo", "Dinkins", "Doran", "Dugelman", "Dugan", "Duffman", "Eastman", "Ferro", "Ferry", "Fletcher", "Fietzer", "Hylan", "Hydinger", "Illingsworth", "Ingram", "Irwin", "Jagtap", "Jenson", "Johnson", "Johnsen", "Jones", "Jurgenson", "Kalleg", "Kaskel", "Keller", "Leisinger", "LePage", "Lewis", "Linde", "Lulloff", "Maki", "Martin", "McGinnis", "Mills", "Moody", "Moore", "Napier", "Nelson", "Norquist", "Nuttle", "Olson", "Ostrander", "Reamer", "Reardon", "Reyes", "Rice", "Ripka", "Roberts", "Rogers", "Root", "Sandstrom", "Sawyer", "Schlicht", "Schmitt", "Schwager", "Schutz", "Schuster", "Tapia", "Thompson", "Tiernan", "Tisler" ];
const lastname = ["Adam", "Alex", "Aaron", "Ben", "Carl", "Dan", "David", "Edward", "Fred", "Frank", "George", "Hal", "Hank", "Ike", "John", "Jack", "Joe", "Larry", "Monte", "Matthew", "Mark", "Nathan", "Otto", "Paul", "Peter", "Roger", "Roger", "Steve", "Thomas", "Tim", "Ty", "Victor", "Walter"];
const gender = ['Male', 'Female'];
const religion = ['Islam', 'Katolik', 'Kristen', 'Hindu', 'Budha', 'Penghayat kepercayaan']
const tribe = ['Jawa', 'Sunda', 'Bugis', 'Papuan', 'Balinesse', 'Batak']

function getRandom(arr, isRemove = false) {
    const randomIndex = Math.floor(Math.random() * arr.length)
    
    if (isRemove) {
        const newArr = arr[randomIndex]
        arr.splice(randomIndex, 1)
        return newArr;
    }
    return arr[randomIndex];
}

function getRandomMinMax(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

function getRandomBirtDate() {
    return `${getRandomMinMax(1950, 1990)}-${getRandomMinMax(1, 12)}-${getRandomMinMax(1, 30)}`
}

function getRandomHobbies() {
    const hobbies = ['Swimming', 'Hiking', 'Cycling', 'Riding', 'Painting', 'Jogging', 'Reading']
    const maxLength = getRandomMinMax(2, 4);
    
    const newHobby = [];
    
    for(let i = 0; i < maxLength; i++) {
        newHobby.push(getRandom(hobbies, true))
    }
    
    return newHobby
}

function getRandomParent() {
    return {
        father: `${getRandom(firstname)} ${getRandom(lastname)}`,
        mother: `${getRandom(firstname)} ${getRandom(lastname)}`
    }
}

const banyakData = 30
for (let i = 0; i < banyakData; i++) {
    const firstName = getRandom(firstname);
    const lastName = getRandom(lastname);
    db.profiles.insert({
        first_name: firstName,
        last_name: lastName,
        full_name: firstName + ' ' + lastName,
        birth: new Date(getRandomBirtDate()),
        parent: getRandomParent(),
        heigh: getRandomMinMax(165, 195),
        weight: getRandomMinMax(50, 80),
        gender: getRandom(gender),
        religion: getRandom(religion),
        hobby: getRandomHobbies(),
        race: getRandom(tribe),
    })
}