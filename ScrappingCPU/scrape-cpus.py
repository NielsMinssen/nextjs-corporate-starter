import csv
from bs4 import BeautifulSoup
import re

def clean_text(text):
    # Remove newlines and extra spaces
    cleaned = re.sub(r'\s+', ' ', text).strip()
    return cleaned

def extract_numeric_value(text):
    """ Extracts only numeric values from the given text. """
    # Replace commas with empty string and extract numeric parts
    cleaned = re.sub(r'[^\d.]', '', text)  # Remove anything that's not a digit or period
    return cleaned if cleaned else ''

def parse_html_table(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    table = soup.find('table', id='cputable')
    rows = table.find_all('tr')
    
    data = []
    for row in rows[1:]:  # Skip the header row
        cols = row.find_all('td')
        if len(cols) >= 13:  # Ensure enough columns exist in each row
            cpu_name = clean_text(cols[1].text)
            num_sockets = cols[2].text.strip()
            cores = cols[3].text.strip()
            price = extract_numeric_value(cols[4].text.strip())
            cpu_mark = cols[5].text.strip()
            cpu_value = cols[6].text.strip()
            thread_mark = cols[7].text.strip()
            thread_value = cols[8].text.strip()
            tdp = cols[9].text.strip()
            power_perf = cols[10].text.strip()
            test_date = cols[11].text.strip()
            socket = cols[12].text.strip()
            category = cols[13].text.strip()

            # Append the extracted data to the list
            data.append([
                cpu_name,
                num_sockets if num_sockets != 'NA' else '',
                cores if cores != 'NA' else '',
                price if price != 'NA' else '',
                cpu_mark if cpu_mark != 'NA' else '',
                cpu_value if cpu_value != 'NA' else '',
                thread_mark if thread_mark != 'NA' else '',
                thread_value if thread_value != 'NA' else '',
                tdp if tdp != 'NA' else '',
                power_perf if power_perf != 'NA' else '',
                test_date,
                socket if socket != 'NA' else '',
                category
            ])
    
    return data

def write_csv(data, filename):
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(['cpu_name', 'num_sockets', 'cores', 'price', 'cpu_mark', 'cpu_value', 'thread_mark', 'thread_value', 'tdp', 'power_perf', 'test_date', 'socket', 'category'])
        writer.writerows(data)

# Main execution
html_content = """
<table id="cputable" class="dataTable-blue dataTable no-footer" style="width: 100%;" role="grid" aria-describedby="cputable_info">
    <thead>
        <tr role="row"><th class="details-control sorting_disabled" rowspan="1" colspan="1" style="width: 15px;" aria-label=""></th><th class="sorting_asc" tabindex="0" aria-controls="cputable" rowspan="1" colspan="1" style="width: 158px;" aria-label="CPU Name: activate to sort column descending" aria-sort="ascending">CPU Name<br><input id="search_name" type="text" placeholder="Search..."></th><th class="sorting" tabindex="0" aria-controls="cputable" rowspan="1" colspan="1" style="width: 73px;" aria-label="Number of Sockets
                
                    
                    Single
                    Multiple
                
            : activate to sort column ascending">Number of Sockets<br>
                <select id="search_num_sockets">
                    <option value=""></option>
                    <option value="Single">Single</option>
                    <option value="Multiple">Multiple</option>
                </select>
            </th><th class="sorting" tabindex="0" aria-controls="cputable" rowspan="1" colspan="1" style="width: 46px;" aria-label="Cores
                &amp;nbsp;-&amp;nbsp;
            : activate to sort column ascending">Cores<br>
                <input id="cores_min" type="text" size="4" placeholder="Min...">&nbsp;-&nbsp;<input id="cores_max" type="text" size="4" placeholder="Max...">
            </th><th class="sorting" tabindex="0" aria-controls="cputable" aria-label="Price1: activate to sort column ascending" rowspan="1" colspan="1" style="width: 50px;">Price<sup><a href="#notes">1</a></sup></th><th class="sorting" tabindex="0" aria-controls="cputable" rowspan="1" colspan="1" style="width: 60px;" aria-label="CPU Mark
                &amp;nbsp;-&amp;nbsp;
            : activate to sort column ascending">CPU Mark<br>
                <input id="cpu_min" type="text" size="6" placeholder="Min...">&nbsp;-&nbsp;<input id="cpu_max" type="text" size="6" placeholder="Max...">
            </th><th class="sorting" tabindex="0" aria-controls="cputable" aria-label="CPU Value2: activate to sort column ascending" rowspan="1" colspan="1" style="width: 45px;">CPU Value<sup><a href="#notes">2</a></sup></th><th class="sorting" tabindex="0" aria-controls="cputable" rowspan="1" colspan="1" style="width: 60px;" aria-label="Thread Mark
                &amp;nbsp;-&amp;nbsp;
            : activate to sort column ascending">Thread Mark<br>
                <input id="thread_min" type="text" size="6" placeholder="Min...">&nbsp;-&nbsp;<input id="thread_max" type="text" size="6" placeholder="Max...">
            </th><th class="sorting" tabindex="0" aria-controls="cputable" aria-label="Thread Value3: activate to sort column ascending" rowspan="1" colspan="1" style="width: 45px;">Thread Value<sup><a href="#notes">3</a></sup></th><th class="sorting" tabindex="0" aria-controls="cputable" rowspan="1" colspan="1" style="width: 46px;" aria-label="TDP (W)
                &amp;nbsp;-&amp;nbsp;
            : activate to sort column ascending">TDP (W)<br>
                <input id="tdp_min" type="text" size="4" placeholder="Min...">&nbsp;-&nbsp;<input id="tdp_max" type="text" size="4" placeholder="Max...">
            </th><th class="sorting" tabindex="0" aria-controls="cputable" aria-label="Power Perf.4: activate to sort column ascending" rowspan="1" colspan="1" style="width: 41px;">Power Perf.<sup><a href="#notes">4</a></sup></th><th class="sorting" tabindex="0" aria-controls="cputable" aria-label="Test Date5: activate to sort column ascending" rowspan="1" colspan="1" style="width: 40px;">Test Date<sup><a href="#notes">5</a></sup></th><th class="sorting" tabindex="0" aria-controls="cputable" rowspan="1" colspan="1" style="width: 100px;" aria-label="Socket
                
                    
                BGA 479BGA 1023BGA 1168BGA 1356BGA 1440BGA 1449BGA 1526BGA 1528BGA 1598BGA 1744BGA 1787BGA 2049LGA 771LGA 775LGA 1150LGA 1151LGA 1155LGA 1156LGA 1200LGA 1356LGA 1366LGA 1700LGA 1744LGA 1787LGA 2011LGA 2011-v3LGA 2066LGA 3647LGA 4189PGA 478PGA 988APGA 988BAM5AM4AM3/AM3+AM2/AM2+FM1S1FS1FM2/FM2+FP4FP5FP6FP7G34SP3sTR4sTRX4sWRX8Unknown
            : activate to sort column ascending">Socket<br>
                <select id="search_socket">
                    <option value=""></option>
                <option value="0">BGA 479</option><option value="1">BGA 1023</option><option value="2">BGA 1168</option><option value="3">BGA 1356</option><option value="4">BGA 1440</option><option value="5">BGA 1449</option><option value="6">BGA 1526</option><option value="7">BGA 1528</option><option value="8">BGA 1598</option><option value="9">BGA 1744</option><option value="10">BGA 1787</option><option value="11">BGA 2049</option><option value="12">LGA 771</option><option value="13">LGA 775</option><option value="14">LGA 1150</option><option value="15">LGA 1151</option><option value="16">LGA 1155</option><option value="17">LGA 1156</option><option value="18">LGA 1200</option><option value="19">LGA 1356</option><option value="20">LGA 1366</option><option value="21">LGA 1700</option><option value="22">LGA 1744</option><option value="23">LGA 1787</option><option value="24">LGA 2011</option><option value="25">LGA 2011-v3</option><option value="26">LGA 2066</option><option value="27">LGA 3647</option><option value="28">LGA 4189</option><option value="29">PGA 478</option><option value="30">PGA 988A</option><option value="31">PGA 988B</option><option value="32">AM5</option><option value="33">AM4</option><option value="34">AM3/AM3+</option><option value="35">AM2/AM2+</option><option value="36">FM1</option><option value="37">S1</option><option value="38">FS1</option><option value="39">FM2/FM2+</option><option value="40">FP4</option><option value="41">FP5</option><option value="42">FP6</option><option value="43">FP7</option><option value="44">G34</option><option value="45">SP3</option><option value="46">sTR4</option><option value="47">sTRX4</option><option value="48">sWRX8</option><option value="49">Unknown</option></select>
            </th><th class="sorting" tabindex="0" aria-controls="cputable" rowspan="1" colspan="1" style="width: 131px;" aria-label="Category
                
                    
                    Unknown
                    Desktop
                    Laptop
                    Server
                    Mobile/Embedded
                
            : activate to sort column ascending">Category<br>
                <select id="search_category">
                    <option value=""></option>
                    <option value="Unknown">Unknown</option>
                    <option value="Desktop">Desktop</option>
                    <option value="Laptop">Laptop</option>
                    <option value="Server">Server</option>
                    <option value="Mobile">Mobile/Embedded</option>
                </select>
            </th></tr>
    </thead>
"""

scraped_data = parse_html_table(html_content)
write_csv(scraped_data, 'cpus.csv')

print("CSV file 'cpus.csv' has been created successfully.")