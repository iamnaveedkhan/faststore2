const {
  Address,
  Staff,
  Model2,
  Inquiry,
  Customer,
  Retailer,
  Status,
} = require("../../models/allModels");
const { DateTime, Interval } = require("luxon");

async function getDashboardData(fastify, options) {
  fastify.get(
    "/models-count",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const totalModelCount = await Model2.countDocuments();
        const activeModelCount = await Model2.countDocuments({
          isActive: true,
        });
        return { totalModelCount, activeModelCount };
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/customer-retailer-count",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const now = DateTime.local();
        const timeZone = "Asia/Kolkata";
        const nowIST = now.setZone(timeZone);

        const todayInterval = Interval.fromDateTimes(
          nowIST.startOf("day"),
          nowIST.endOf("day")
        );
        const weekInterval = Interval.fromDateTimes(
          nowIST.startOf("week").set({ weekday: 1 }),
          nowIST.endOf("week")
        );
        const monthInterval = Interval.fromDateTimes(
          nowIST.startOf("month"),
          nowIST.endOf("month")
        );

        const [
          activeCustomers,
          todayCustomerCount,
          weekCustomerCount,
          monthCustomerCount,
          activeRetailers,
          todayRetailerCount,
          weekRetailerCount,
          monthRetailerCount,
        ] = await Promise.all([
          Customer.countDocuments({
            isActive: 1,
          }),
          Customer.countDocuments({
            date: {
              $gte: todayInterval.start.toJSDate(),
              $lte: todayInterval.end.toJSDate(),
            },
          }),
          Customer.countDocuments({
            date: {
              $gte: weekInterval.start.toJSDate(),
              $lte: weekInterval.end.toJSDate(),
            },
          }),
          Customer.countDocuments({
            date: {
              $gte: monthInterval.start.toJSDate(),
              $lte: monthInterval.end.toJSDate(),
            },
          }),
          Retailer.countDocuments({
            isActive: 1,
          }),
          Retailer.countDocuments({
            date: {
              $gte: todayInterval.start.toJSDate(),
              $lte: todayInterval.end.toJSDate(),
            },
          }),
          Retailer.countDocuments({
            date: {
              $gte: weekInterval.start.toJSDate(),
              $lte: weekInterval.end.toJSDate(),
            },
          }),
          Retailer.countDocuments({
            date: {
              $gte: monthInterval.start.toJSDate(),
              $lte: monthInterval.end.toJSDate(),
            },
          }),
        ]);

        return {
          customer: {
            activeCustomers: activeCustomers,
            todayAddedCustomerCount: todayCustomerCount,
            weekAddedCustomerCount: weekCustomerCount,
            monthAddedCustomerCount: monthCustomerCount,
          },
          retailer: {
            activeRetailers: activeRetailers,
            todayAddedRetailerCount: todayRetailerCount,
            weekAddedRetailerCount: weekRetailerCount,
            monthAddedRetailerCount: monthRetailerCount,
          },
        };
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/enquiry-count",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const now = DateTime.local();
        const timeZone = "Asia/Kolkata";
        const nowIST = now.setZone(timeZone);

        const todayInterval = Interval.fromDateTimes(
          nowIST.startOf("day"),
          nowIST.endOf("day")
        );
        const weekInterval = Interval.fromDateTimes(
          nowIST.startOf("week").set({ weekday: 1 }),
          nowIST.endOf("week")
        );
        const monthInterval = Interval.fromDateTimes(
          nowIST.startOf("month"),
          nowIST.endOf("month")
        );

        const [totalEnquiry, todayEnquiry, weekEnquiry, monthEnquiry] =
          await Promise.all([
            Inquiry.countDocuments(),
            Inquiry.countDocuments({
              date: {
                $gte: todayInterval.start.toJSDate(),
                $lte: todayInterval.end.toJSDate(),
              },
            }),
            Inquiry.countDocuments({
              date: {
                $gte: weekInterval.start.toJSDate(),
                $lte: weekInterval.end.toJSDate(),
              },
            }),
            Inquiry.countDocuments({
              date: {
                $gte: monthInterval.start.toJSDate(),
                $lte: monthInterval.end.toJSDate(),
              },
            }),
          ]);

        return {
          totalEnquiry: totalEnquiry,
          todayEnquiry: todayEnquiry,
          weekEnquiry: weekEnquiry,
          monthEnquiry: monthEnquiry,
        };
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  const { DateTime, Interval } = require("luxon");

  fastify.get(
    "/monthly-enquired-count",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const now = DateTime.local();
        const timeZone = "Asia/Kolkata";
        const nowIST = now.setZone(timeZone);

        const startOfYear = nowIST.startOf("year");
        const currentMonth = nowIST.month;

        const monthlyIntervals = [];
        for (let month = 1; month <= currentMonth; month++) {
          const startOfMonth = startOfYear.set({ month }).startOf("month");
          const endOfMonth = startOfYear.set({ month }).endOf("month");
          monthlyIntervals.push({ startOfMonth, endOfMonth });
        }

        const enquiryCounts = await Promise.all(
          monthlyIntervals.map(({ startOfMonth, endOfMonth }) =>
            Inquiry.countDocuments({
              date: {
                $gte: startOfMonth.toJSDate(),
                $lte: endOfMonth.toJSDate(),
              },
            })
          )
        );

        const response = {};
        const monthNames = [
          "jan",
          "feb",
          "mar",
          "apr",
          "may",
          "jun",
          "jul",
          "aug",
          "sep",
          "oct",
          "nov",
          "dec",
        ];
        for (let i = 0; i < currentMonth; i++) {
          response[monthNames[i]] = enquiryCounts[i];
        }

        return response;
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/monthly-customer-retailer-count",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const now = DateTime.local();
        const timeZone = "Asia/Kolkata";
        const nowIST = now.setZone(timeZone);

        const startOfYear = nowIST.startOf("year");
        const currentMonth = nowIST.month;

        const monthlyIntervals = [];
        for (let month = 1; month <= currentMonth; month++) {
          const startOfMonth = startOfYear.set({ month }).startOf("month");
          const endOfMonth = startOfYear.set({ month }).endOf("month");
          monthlyIntervals.push({ startOfMonth, endOfMonth });
        }

        const customerCounts = await Promise.all(
          monthlyIntervals.map(({ startOfMonth, endOfMonth }) =>
            Customer.countDocuments({
              date: {
                $gte: startOfMonth.toJSDate(),
                $lte: endOfMonth.toJSDate(),
              },
            })
          )
        );

        const retailerCounts = await Promise.all(
          monthlyIntervals.map(({ startOfMonth, endOfMonth }) =>
            Retailer.countDocuments({
              date: {
                $gte: startOfMonth.toJSDate(),
                $lte: endOfMonth.toJSDate(),
              },
            })
          )
        );

        const response = {
          retailers: {},
          customers: {},
        };
        const monthNames = [
          "jan",
          "feb",
          "mar",
          "apr",
          "may",
          "jun",
          "jul",
          "aug",
          "sep",
          "oct",
          "nov",
          "dec",
        ];
        for (let i = 0; i < currentMonth; i++) {
          response.retailers[monthNames[i]] = retailerCounts[i];
          response.customers[monthNames[i]] = customerCounts[i];
        }

        return response;
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
  // ------------------------------For Retailers----------------------------------------------------
  fastify.get(
    "/monthly-enquiry-count-retailer",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const userId = req.user.userId._id;

        const now = DateTime.local();
        const timeZone = "Asia/Kolkata";
        const nowIST = now.setZone(timeZone);

        const startOfYear = nowIST.startOf("year");
        const currentMonth = nowIST.month;

        const monthlyIntervals = [];
        for (let month = 1; month <= currentMonth; month++) {
          const startOfMonth = startOfYear.set({ month }).startOf("month");
          const endOfMonth = startOfYear.set({ month }).endOf("month");
          monthlyIntervals.push({ startOfMonth, endOfMonth });
        }

        const enquiryCount = await Promise.all(
          monthlyIntervals.map(({ startOfMonth, endOfMonth }) =>
            Inquiry.countDocuments({
              "shop._id": userId,
              date: {
                $gte: startOfMonth.toJSDate(),
                $lte: endOfMonth.toJSDate(),
              },
            })
          )
        );

        const response = {};
        const monthNames = [
          "jan",
          "feb",
          "mar",
          "apr",
          "may",
          "jun",
          "jul",
          "aug",
          "sep",
          "oct",
          "nov",
          "dec",
        ];
        for (let i = 0; i < currentMonth; i++) {
          response[monthNames[i]] = enquiryCount[i];
        }

        return response;
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/current-month-enquiry-count-retailer",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const userId = req.user.userId._id;

        const now = DateTime.local();
        const timeZone = "Asia/Kolkata";
        const nowIST = now.setZone(timeZone);

        const startOfMonth = nowIST.startOf("month");
        const endOfMonth = nowIST.endOf("month");

        let startOfWeek = startOfMonth;
        const weeklyIntervals = [];

        while (startOfWeek < endOfMonth) {
          let endOfWeek = startOfWeek.plus({ days: 6 }).endOf("day");
          if (endOfWeek > endOfMonth) {
            endOfWeek = endOfMonth;
          }
          weeklyIntervals.push({ startOfWeek, endOfWeek });
          startOfWeek = endOfWeek.plus({ days: 1 }).startOf("day");
        }

        const enquiryCount = await Promise.all(
          weeklyIntervals.map(({ startOfWeek, endOfWeek }) =>
            Inquiry.countDocuments({
              "shop._id": userId,
              date: {
                $gte: startOfWeek.toJSDate(),
                $lte: endOfWeek.toJSDate(),
              },
            })
          )
        );

        const response = {};

        weeklyIntervals.forEach((interval, index) => {
          response[`week${index + 1}`] = enquiryCount[index];
        });

        return response;
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/pastSevenDays-enquiry-count-retailer",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const userId = req.user.userId._id;

        const now = DateTime.local();
        const timeZone = "Asia/Kolkata";
        const nowIST = now.setZone(timeZone);

        const startOfPeriod = nowIST.minus({ days: 6 }).startOf("day");
        const endOfPeriod = nowIST.endOf("day");

        const dailyIntervals = [];
        for (let i = 0; i < 7; i++) {
          const startOfDay = startOfPeriod.plus({ days: i }).startOf("day");
          const endOfDay = startOfPeriod.plus({ days: i }).endOf("day");
          dailyIntervals.push({ startOfDay, endOfDay });
        }

        const enquiryCount = await Promise.all(
          dailyIntervals.map(({ startOfDay, endOfDay }) =>
            Inquiry.countDocuments({
              "shop._id": userId,
              date: {
                $gte: startOfDay.toJSDate(),
                $lte: endOfDay.toJSDate(),
              },
            })
          )
        );

        const response = {};

        for (let i = 0; i < 7; i++) {
          const dayName = startOfPeriod.plus({ days: i }).toFormat("cccc");
          response[dayName] = enquiryCount[i];
        }

        return response;
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/staff-retailers-count",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const Id = req.user.userId._id;
        const staff = await Staff.findById(Id);
        if (!staff) {
          return reply.code(401).send({ error: "Unauthorized!" });
        }

        const pickedCount = await Retailer.countDocuments({
          $and: [{ isActive: false }, { manager: Id }, { status: 3 }],
        });
        const followUpCount = await Retailer.countDocuments({
          $and: [{ isActive: false }, { manager: Id }, { status: 5 }],
        });
        const notAnsweredCount = await Retailer.countDocuments({
          $and: [{ isActive: false }, { manager: Id }, { status: 4 }],
        });
        const notInterestedCount = await Retailer.countDocuments({
          $and: [{ isActive: false }, { manager: Id }, { status: 6 }],
        });
        const CompletedCount = await Retailer.countDocuments({
          $and: [{ isActive: false }, { manager: Id }, { status: 7 }],
        });
        const subscribedCount = await Retailer.countDocuments({
          $and: [{ isActive: true }, { manager: Id }, { status: 1 }],
        });

        return {
          pickedCount,
          followUpCount,
          notAnsweredCount,
          notInterestedCount,
          CompletedCount,
          subscribedCount,
        };
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/latest-ten-enquiries",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const userId = req.user.userId._id;
        const staff = await Staff.findById(userId);
  
        if (!staff) {
          return reply.code(401).send({ error: "Unauthorized!" });
        }

        const latest10Inquiries = await Inquiry.find()
          .sort({ date: -1 }) 
          .limit(10);
  
        return reply.send(latest10Inquiries);
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/your-active-retailers",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const managerId = req.user.userId._id;
        const staff = await Staff.findById(managerId);
        console.log("managerId",managerId);
        if (!staff) {
          return reply.code(401).send({ error: "Unauthorized!" });
        }

        const yourRecentActiveRetailers = await Status.find({manager:managerId,status:1})
          .populate({
            path: "retailer",
            select: "name mobile email latitude longitude",
          })
          .sort({ date: -1 }) 
          .limit(10);
  
        return reply.send(yourRecentActiveRetailers);
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

}

module.exports = getDashboardData;
