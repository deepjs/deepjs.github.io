/**
 * @author Gilles Coomans <gilles.coomans@gmail.com>
 * Unit test class and statics.
 * Manage natively promise pattern.
 */
if (typeof define !== 'function') {
	var define = require('amdefine')(module);
}

define(["require", "../deep"], function(require, deep) {

	function Unit(unit) {
		if (unit)
			deep.aup(unit, this);
		//console.log("Unit created : ", this);
		this.tests = this.tests || {};
	}

	Unit.prototype = {
		_deep_unit_: true,
		title: "Generic tests",
		stopOnError: false,
		options: null,
		setup: function(options) {},
		clean: function(options) {
			delete this.context;
		},
		run: function(tests, options) {
			options = options || {};
			tests = tests || [];
			if (!tests.forEach)
				tests = [tests];

			var toTest = this.tests;
			if (toTest._deep_ocm_)
				toTest = toTest();
			//console.log("unit context : ", context);
			var functions = deep.query(toTest, "./[" + tests.join(",") + "]", {
				fullOutput: true
			});
			var numberOfTests = functions.length;
			var stopOnError = this.stopOnError;
			if (typeof options.stopOnError !== 'undefined')
				stopOnError = options.stopOnError;
			if (options.verbose !== false) {
				if (console.group)
					console.group("unit : " + this.title);

				console.log("\n\n**********************************************************");
				console.log("*****  lib/unit : will run : ", this.title, " *****");
				console.log("\tStop on error ? ", stopOnError);
				console.log("\tNumber of tests : ", functions.length, "\n");
			}
			//console.log("\tContext : ",context,"\n\n" );
			var errors = [];
			var self = this,
				totalTime = 0;

			if (functions.length === 0) {
				if (options.verbose !== false) {
					console.log("**********************************************************");
					console.log("************* Nothing to do : aborting unit **************");
					console.log("**********************************************************");
					if (console.groupEnd)
						console.groupEnd();
				}
				return {
					title: self.title,
					numberOfTests: 0,
					success: 0,
					failure: 0,
					ommited: 0,
					errors: errors,
					valid: true,
					time: 0
				};
			}
			var results = [];
			var d = deep.contextualise({ protocols:{}, session:null, rethrow:false, debug:true }).done(function(){ return self.setup(options); });
			var closure = {};
			var applyTest = function(fn) {
				if (fn._deep_ocm_)
					fn = fn();
				if (options.verbose !== false)
					console.log("\n- unit test runned : ", fn.key);
				closure.fn = fn;
				var time = new Date().getTime();
				return deep.when(fn.value.call(self.context))
					.always(function(s, e) {
						time = new Date().getTime() - time;
						totalTime += time;
						if (options.verbose !== false)
							if (e)
								console.error("****** test failed ! ******* : ", fn.key, " error : ", e, e.report);
							else
								console.log("\tok !         (" + time + " ms)");
					});
			};
			var done = function(r) {
				results.push(r);
				if (functions.length > 0)
					d.when(applyTest(functions.shift())).done(done).fail(fail);
			};
			var fail = function(error) {
				results.push(error);
				errors.push({
					unit: self.title,
					test: closure.fn.key,
					error: error
				});
				//deep.utils.dumpError(error);
				if (!stopOnError && functions.length > 0)
					d.when(applyTest(functions.shift())).done(done).fail(fail);
				return true;
			};
			d.always(function() {
				if (options.verbose !== false)
					console.log("\tsetup done.");
			})
			.done(function(context) {
				self.context = context || { debug:true };
				this.when(applyTest(functions.shift()))
					.done(done)
					.fail(fail);
			})
			.always(function(s, e) {
				//console.log("_______________________________________________ unit test result : ",s,e);
				if (options.verbose !== false) {
					console.log("\n*************", self.title, " : time ****************");

					if (e || results.length < numberOfTests || errors.length > 0)
						console.warn("*************", self.title, " : FAILED **************");
					else
						console.log("*************", self.title, " : PASSED **************");

					if (errors.length > 0) {
						console.log("\n\tErrors : ");
						console.log("\t", e || errors);
					}

					console.log("\n\tNumber of tests : ", numberOfTests);
					console.log("\tsuccess : ", results.length - errors.length, "/", numberOfTests);
					console.log("\tfailure : ", errors.length, "/", numberOfTests);
					console.log("\tommited : ", numberOfTests - results.length, "/", numberOfTests);
					console.log("\ttime : ", totalTime);
				}
				return self.clean();
			})
			.always(function(s, e) {
				if (options.verbose !== false) {
					if (e)
						console.log("error while cleanin test : ", self.title, " : ", e);
					console.log("\n**************", self.title, " cleaned **************");
					console.log("***********************************************************");
					if (console.groupEnd)
						console.groupEnd();
				}
				return {
					title: self.title,
					numberOfTests: numberOfTests,
					success: results.length - errors.length,
					failure: errors.length,
					ommited: numberOfTests - results.length,
					//results:results,
					errors: errors,
					valid: ((errors.length === 0) && (results.length == numberOfTests)),
					time: totalTime
				};
			});
			return d;
		}
	};


	function reportToString(){
		var report = this, e = this.finalError;
		var output = "";
		output += "\n\n\n___________________________________________________________________";
		output += "\n*******************************************************************";
		output += "\n************************** Bunch time : ***************************";
		
		if (e)
			output += "\nerror while executings tests bunch : ";
			output +=  e;
		output += "\n*******************************************************************";
		output += "\n********** tests bunch arrived to end : final report : ************";
		//console.log("\n",report,"\n");
		if(report.errors)
		{
			output += "\n\tErrors: ";
			report.errors.forEach(function(e) {
				output += e.unit + ":" + e.test + " " + String(e.error);
				if (e.error && e.error.report)
					output += "\nreport : " + report.toString();

			});
		}
		else 
			output += "\n\tNo errors.\n";
		output += "\n\tNumber of units : " + report.numberOfUnits;
		output += "\n\tNumber of tests : " + report.numberOfTests;
		output += "\n\tsuccess : " + report.success + "/" + report.numberOfTests;
		output += "\n\tfailure : " + report.failure + "/" + report.numberOfTests;
		output += "\n\tommited : " + report.ommited + "/" + report.numberOfTests;
		output += "\n\tommiteds : " + report.ommiteds;

		output += "\n\ttime : " + report.time;
		output += "\n\ttotalTime : " + report.totalTime;
		output += "\n\tcounters : " + JSON.stringify(deep.counter, null, ' ');
		//output += JSON.stringify(report, null, ' '));
		output += "\n*******************************************************************";
		output += "\n*******************************************************************";
		output += "\n___________________________________________________________________\n\n";
		return output;
	}

	Unit.run = deep.test = function(units, options) {
		if (!options && units === false)
			options = units;
		if (options === false)
			options = {
				verbose: false
			};
		else
			options = options || {};
		//if(options.verbose !== false)
		//{
		console.log("\n*******************************************************************");
		console.log("*************************** Units Bunch ****************************");
		//}
		units = units || deep.coreUnits;
		var alls = [];
		if (!units.forEach)
			units = [units];
		units.forEach(function(unit) {
			if (typeof unit === 'string')
				alls.push(deep.get(unit));
			else
				alls.push(unit);
		});
		var report = {
			reports: [],
			errors: [],
			numberOfUnits: units.length,
			numberOfTests: 0,
			success: 0,
			failure: 0,
			ommited: 0,
			ommiteds: [],
			time: 0
		};
		deep.counter = {
			delayCount: 0
		};
		if (alls.length === 0)
			return deep.when(report);
		return deep.all(alls)
			.done(function(units) {
				deep.Promise.context = this._context = { $:deep.Promise.context.$, debug:true };
				//console.log("units loaded : ", units);
				if (options.profile)
					console.profile("bunch");
				var results = [];
				var errors = [];
				var doTest = function(unit) {
					unit = new deep.Unit(unit);
					if (options.verbose !== false)
						console.log("\n\n\n*************** Executing unit : ", unit.title);
					return deep.when(unit.run("*", options));
				};
				var startTime = new Date().getTime();

				//if(options.verbose !== false)
				if (console.time)
					console.time("bunch");
				var d = deep.when(doTest(units.shift()));
				var always = function(s, e) {
					if (e)
						report.errors.push(e);
					report.reports.push(s);
					report.success += s.success;
					report.failure += s.failure;
					report.ommited += s.ommited;
					if(s.ommited)
						report.ommiteds.push(s.title);
					report.numberOfTests += s.numberOfTests;
					report.errors = report.errors.concat(s.errors);
					report.time += s.time;
					results.push(s);
					if (units.length > 0)
						d.when(doTest(units.shift())).always(always);
					return true;
				};
				return d.always(always)
					.always(function(s, e) {
						if (options.profile)
							console.profileEnd("bunch");
						report.totalTime = new Date().getTime() - startTime;
						report.counters = deep.counter;
						//if(options.verbose !== false)
						//{
						console.log("\n\n\n___________________________________________________________________");
						console.log("\n*******************************************************************");
						console.log("************************** Bunch time : ***************************");
						if (console.time)
							console.timeEnd("bunch");
						if (e)
							console.log("error while executings tests bunch : ", e);
						console.log("*******************************************************************");
						console.log("********** tests bunch arrived to end : final report : ************");
						//console.log("\n",report,"\n");
						if(report.errors)
						{
							console.log("\n\tErrors: ");
							report.errors.forEach(function(e) {
								console.log(e.unit + ":" + e.test, String(e.error));
								if (e.error && e.error.report)
									console.log("report : ", report.toString());

							});
						}
						else 
							console.log("\n\tNo errors.\n")
						console.log("\tNumber of units : ", report.numberOfUnits);
						console.log("\tNumber of tests : ", report.numberOfTests);
						console.log("\tsuccess : ", report.success, "/", report.numberOfTests);
						console.log("\tfailure : ", report.failure, "/", report.numberOfTests);
						console.log("\tommited : ", report.ommited, "/", report.numberOfTests);
						console.log("\tommiteds : ", report.ommiteds);

						console.log("\ttime : ", report.time);
						console.log("\ttotalTime : ", report.totalTime);
						console.log("\tcounters : ", JSON.stringify(deep.counter, null, ' '));
						//console.log(JSON.stringify(report, null, ' '));
						console.log("\n*******************************************************************");
						console.log("*******************************************************************");
						console.log("___________________________________________________________________\n\n");
						//}
						report.toString = reportToString;
						report.finalError = e;
						return report;
					});
			})
			.fail(function(error) {
				console.error("deep : Unit bunch failed to load : ", error);
			});
	};

	deep.Unit = Unit;

	return Unit;
});