// this is the layer where we connect with db
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function getCustomers(times, page, pageSize) {
  console.log("get customers");
  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  let stmt = "";

  if (times === "") {
    stmt = await db.prepare(
      "SELECT * FROM Customer LIMIT $pageSize OFFSET $offset",
      {
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  } else {
    stmt = await db.prepare(
      "SELECT * FROM Customer, Booking WHERE Customer.customerID = Booking.customerID GROUP BY Customer.customerID HAVING count(*) > $times LIMIT $pageSize OFFSET $offset",
      {
        $times: parseInt(times),
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  }

  try {
    let customers = await stmt.all();
    console.log(customers);
    return customers;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getCars(startYear, model, make, page, pageSize) {
  console.log("get cars", startYear, model, make);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  let stmt = "";

  if (startYear === "" && model === "" && make === "") {
    stmt = await db.prepare(
      "SELECT * FROM Car, Car_Model, Car_Make, Car_Category WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID LIMIT $pageSize OFFSET $offset",
      {
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  } else if (startYear !== "") {
    stmt = await db.prepare(
      "SELECT * FROM Car, Car_Model, Car_Make, Car_Category WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND startYear >= $startYear LIMIT $pageSize OFFSET $offset",
      {
        $startYear: startYear,
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  } else if (model !== "" && make !== "") {
    stmt = await db.prepare(
      "SELECT * FROM Car, Car_Model, Car_Make, Car_Category WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND make = $make AND model = $model LIMIT $pageSize OFFSET $offset",
      {
        $make: make,
        $model: model,
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  } else if (model === "") {
    stmt = await db.prepare(
      "SELECT * FROM Car, Car_Model, Car_Make, Car_Category WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND make = $make LIMIT $pageSize OFFSET $offset",
      {
        $make: make,
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  } else {
    stmt = await db.prepare(
      "SELECT * FROM Car, Car_Model, Car_Make, Car_Category WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND model = $model LIMIT $pageSize OFFSET $offset",
      {
        $model: model,
        $pageSize: pageSize,
        $offset: (page - 1) * pageSize,
      }
    );
  }

  try {
    let cars = await stmt.all();
    console.log(cars);
    return cars;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getCustomerCount(times) {
  console.log("get customer count", times);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  let stmt = "";
  if (times === "") {
    stmt = await db.prepare("SELECT COUNT(*) AS count FROM Customer");
  } else {
    stmt = await db.prepare(
      "SELECT COUNT(*) AS count FROM (SELECT COUNT(*) FROM Customer, Booking WHERE Customer.customerID = Booking.customerID GROUP BY Customer.customerID HAVING COUNT(*) > $times)",
      {
        $times: parseInt(times),
      }
    );
  }

  try {
    let count = (await stmt.get()).count;
    console.log(count);
    return count;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getCarCount(startYear, model, make) {
  console.log("get car count", startYear, model, make);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  let stmt = "";

  if (startYear === "" && model === "" && make === "") {
    stmt = await db.prepare(
      `
    SELECT COUNT(*) AS count
    FROM Car`
    );
  } else if (startYear !== "") {
    stmt = await db.prepare(
      "SELECT COUNT(*) AS count FROM Car WHERE startYear >= $startYear",
      {
        $startYear: startYear,
      }
    );
  } else if (model !== "" && make !== "") {
    stmt = await db.prepare(
      "SELECT COUNT(*) AS count FROM Car, Car_Model, Car_Make WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND make = $make AND model = $model",
      {
        $make: make,
        $model: model,
      }
    );
  } else if (model === "") {
    stmt = await db.prepare(
      "SELECT COUNT(*) AS count FROM Car, Car_Model, Car_Make WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND make = $make",
      {
        $make: make,
      }
    );
  } else {
    stmt = await db.prepare(
      "SELECT COUNT(*) AS count FROM Car, Car_Model, Car_Make WHERE Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND model = $model",
      {
        $model: model,
      }
    );
  }

  try {
    let count = (await stmt.get()).count;
    console.log(count);
    return count;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getCarByID(carID) {
  console.log("get car by ID", carID);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    SELECT * 
    FROM Car, Car_Model, Car_Make, Car_Category, Rental_Branch
    WHERE carID = @carID AND Car.modelID = Car_Model.modelID AND Car.makeID = Car_Make.makeID AND Car.carCategoryID = Car_Category.categoryID AND Car.currentRentalBranchID = Rental_Branch.rentalBranchID
    `);

  const params = {
    "@carID": carID,
  };

  try {
    return await stmt.get(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getCustomerByID(customerID) {
  console.log("get customer by ID", customerID);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    SELECT *
    FROM Customer
    WHERE Customer.customerID = @customerID
    `);

  const params = {
    "@customerID": customerID,
  };

  try {
    let c = await stmt.get(params);
    console.log(c);
    return c;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getCustomerMembershipStatus(customerID) {
  console.log("get customer membership status", customerID);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    SELECT sum(totalCharge),
    CASE
      WHEN sum(totalCharge) > 3000 THEN 'Gold membership'
      WHEN sum(totalCharge) > 2000 THEN 'Silver membership'
      WHEN sum(totalCharge) > 1000 THEN 'Bronze membership'
      ELSE 'None'
    END AS MembershipAward
    FROM Booking
    WHERE Booking.customerID = @customerID
    `);

  const params = {
    "@customerID": customerID,
  };

  try {
    return await stmt.get(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function getCustomerBookingHistory(customerID) {
  console.log("get customer booking history", customerID);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    SELECT * 
    FROM Booking, Car, Rental_Branch, Car_Make 
    WHERE customerID = @customerID AND Booking.carID = Car.carID AND pickupRentalBranchID = Rental_Branch.rentalBranchID AND Car.makeID = Car_Make.makeID
    `);

  const params = {
    "@customerID": customerID,
  };

  try {
    return await stmt.all(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function updateCarByID(carID, car) {
  console.log("update car by id", carID, car);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    UPDATE Car
    SET
      carCategoryID = @carCategoryID,
      modelID = @modelID,
      makeID = @makeID,
      startYear = @startYear,
      mileage = @mileage,
      isAvailable = @isAvailable,
      currentRentalBranchID = @currentRentalBranchID
    WHERE
       carID = @carID;
    `);

  const params = {
    "@carID": carID,
    "@carCategoryID": car.carCategoryID,
    "@modelID": car.modelID,
    "@makeID": car.makeID,
    "@startYear": car.startYear,
    "@mileage": car.mileage,
    "@isAvailable": car.isAvailable,
    "@currentRentalBranchID": car.currentRentalBranchID,
  };

  try {
    return await stmt.run(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function deleteCarByID(carID) {
  console.log("delete car by ID", carID);

  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`
    DELETE FROM Car
    WHERE
       carID = @carID;
    `);

  const params = {
    "@carID": carID,
  };

  try {
    return await stmt.run(params);
  } finally {
    await stmt.finalize();
    db.close();
  }
}

async function createCar(car) {
  const db = await open({
    filename: "./db/Car.db",
    driver: sqlite3.Database,
  });

  const stmt = await db.prepare(`INSERT INTO
    Car(carCategoryID, modelID, makeID, startYear, mileage, isAvailable, currentRentalBranchID)
    VALUES (@carCategoryID, @modelID, @makeID, @startYear, @mileage, @isAvailable, @currentRentalBranchID);`);

  try {
    let newCar = await stmt.run({
      "@carCategoryID": car.carCategoryID,
      "@modelID": car.modelID,
      "@makeID": car.makeID,
      "@startYear": car.startYear,
      "@mileage": car.mileage,
      // new cars are default to be available
      "@isAvailable": "1",
      "@currentRentalBranchID": car.currentRentalBranchID,
    });
    console.log(newCar);
    return newCar;
  } finally {
    await stmt.finalize();
    db.close();
  }
}

module.exports.getCars = getCars;
module.exports.getCarByID = getCarByID;
module.exports.updateCarByID = updateCarByID;
module.exports.createCar = createCar;
module.exports.deleteCarByID = deleteCarByID;
module.exports.getCarCount = getCarCount;
module.exports.getCustomers = getCustomers;
module.exports.getCustomerCount = getCustomerCount;
module.exports.getCustomerByID = getCustomerByID;
module.exports.getCustomerBookingHistory = getCustomerBookingHistory;
module.exports.getCustomerMembershipStatus = getCustomerMembershipStatus;
