import { useEffect, useState } from "react";
import Papa from 'papaparse';
import ApexCharts from 'apexcharts';

const TableData = () => {
    const [data, setData] = useState([]);
    const [filterData, setFilterData] = useState([]);
    const [secondTable, setSecondTable] = useState(false);
    const [filterSecondData, setFilterSecondData] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'uniqueyear', direction: 'ascending' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/salaries.csv');
                const csv = await response.text();

                Papa.parse(csv, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (result) => {
                        setData(result.data);
                    },
                    error: (error) => {
                        console.error("Error while parsing CSV:", error);
                    }
                });
            } catch (error) {
                console.error("Error fetching CSV file:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const uniqueYears = [...new Set(data.map(row => row.work_year))];
        const allyearstats = uniqueYears.map(uniqueyear => {
            const jobcount = data.filter(ks => ks.work_year.includes(uniqueyear)).length;
            const totalsalary = data.filter(ks => ks.work_year.includes(uniqueyear)).reduce((acc, row) => acc + parseFloat(row.salary_in_usd), 0);
            const avgsalary = (totalsalary / jobcount).toFixed(2);
            return {
                uniqueyear,
                jobcount,
                avgsalary
            }
        });

        setFilterData(allyearstats);
    }, [data]);

    useEffect(() => {
        if (selectedYear) {
            const jobsForSelectedYear = data.filter(row => row.work_year === selectedYear);
            const jobCounts = jobsForSelectedYear.reduce((acc, row) => {
                acc[row.job_title] = (acc[row.job_title] || 0) + 1;
                return acc;
            }, {});
            const jobStats = Object.keys(jobCounts).map(jobTitle => ({
                jobTitle,
                jobCount: jobCounts[jobTitle]
            }));
            setFilterSecondData(jobStats);
        }
    }, [selectedYear, data]);

    useEffect(() => {
        const options = {
            series: [
                {
                    name: "Job counts",
                    data: filterData.map(entry => entry.jobcount)
                },
                {
                    name: "Average salary",
                    data: filterData.map(entry => entry.avgsalary)
                }
            ],
            chart: {
                height: 350,
                type: 'line',
                dropShadow: {
                    enabled: true,
                    color: '#000',
                    top: 18,
                    left: 7,
                    blur: 10,
                    opacity: 0.2
                },
                zoom: {
                    enabled: false
                },
                toolbar: {
                    show: false
                }
            },
            colors: ['#77B6EA', '#545454'],
            dataLabels: {
                enabled: true,
            },
            stroke: {
                curve: 'smooth'
            },
            title: {
                text: 'Job Statistics',
                align: 'left'
            },
            grid: {
                borderColor: '#e7e7e7',
                row: {
                    colors: ['#f3f3f3', 'transparent'],
                    opacity: 0.5
                },
            },
            markers: {
                size: 1
            },
            xaxis: {
                categories: filterData.map(entry => entry.uniqueyear),
                title: {
                    text: 'Year'
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                floating: true,
                offsetY: -25,
                offsetX: -5
            }
        };

        const chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
        return () => {
          chart.destroy();
      };
    }, [filterData]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...filterData].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });

    return (
        <div className="container mx-auto p-4">
            <div id="chart" className="mb-8"></div>
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr className="bg-gray-100">
                        <th onClick={() => handleSort('uniqueyear')} className="py-2 px-4 border-b cursor-pointer"><span className="flex justify-center">Year <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
</svg></span>
 </th>
                        <th onClick={() => handleSort('jobcount')} className="py-2 px-4 border-b cursor-pointer"><span className="flex justify-center">Number of Total Jobs <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
</svg></span>
</th>
                        <th onClick={() => handleSort('avgsalary')} className="py-2 px-4 border-b cursor-pointer"><span className="flex justify-center">Average Salary in USD <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
</svg></span>
</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map(alldata => (
                        <tr key={alldata.uniqueyear} className="cursor-pointer hover:bg-gray-100" onClick={() => { setSelectedYear(alldata.uniqueyear); setSecondTable(true); }}>
                            <td className="py-2 px-4 border-b">{alldata.uniqueyear}</td>
                            <td className="py-2 px-4 border-b">{alldata.jobcount}</td>
                            <td className="py-2 px-4 border-b">{alldata.avgsalary}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {secondTable && (
                <table className="min-w-full bg-white border border-gray-300 mt-8">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="py-2 px-4 border-b">Job Title</th>
                            <th className="py-2 px-4 border-b">Number of Jobs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterSecondData.map(job => (
                            <tr key={job.jobTitle} className="hover:bg-gray-100">
                                <td className="py-2 px-4 border-b">{job.jobTitle}</td>
                                <td className="py-2 px-4 border-b">{job.jobCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default TableData;
