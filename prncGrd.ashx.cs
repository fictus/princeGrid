using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Script.Serialization;

namespace DotNetNuke.Modules.PrinceGrid //
{
    /// <summary>
    /// Summary description for prncGrd
    /// </summary>
    public class prncGrd : IHttpHandler
    {

        public void ProcessRequest(HttpContext context)
        {
            string writeResult = "";
            try
            {
                var jss = new JavaScriptSerializer();
                string json = new StreamReader(context.Request.InputStream).ReadToEnd();
                Dictionary<string, object> sData = jss.Deserialize<Dictionary<string, object>>(json);
                //object prmsExist = sData["paramsPrinceGrid"];
                string xWHAT = sData["prncFunction"].ToString();

                Type t = this.GetType();
                MethodInfo method = t.GetMethod(xWHAT);
                object[] Params = new object[] { json };
                method.Invoke(this, Params);
            }
            catch (Exception ex)
            {
                writeResult = "{ \"responseResult\": \"Failed\", \"errorCode\": \"" + ex.Message.ToString().Trim() + "\" }";
                HttpContext.Current.Response.ContentType = "application/json";
                HttpContext.Current.Response.Write(writeResult);
            }
        }

        public void selectData(string json)
        {
            string writeResult = "";
            try
            {
                var jss = new JavaScriptSerializer();
                Dictionary<string, object> sData = jss.Deserialize<Dictionary<string, object>>(json);
                object prmsExist = sData["paramsPrinceGrid"];
                //object xWHAT = ((Dictionary<string, object>)sData["paramsPrinceGrid"])["param1"];

                DataTable tblResults = new DataTable();
                string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings[sData["connection"].ToString()].ConnectionString; //System.Web.Configuration.WebConfigurationManager.ConnectionStrings["QuotingSystemDataServer"].ConnectionString;

                string paramsFoundSQL = "";
                using (SqlConnection dbConnection = new SqlConnection(connectionString))
                {

                    dbConnection.Open();
                    //create command object
                    SqlCommand dbCommand = new SqlCommand();
                    dbCommand = new SqlCommand(sData["StoredProc"].ToString(), dbConnection);
                    //set command object to stored procedure
                    dbCommand.CommandType = CommandType.StoredProcedure;

                    // add parameter to command
                    //dbCommand.Parameters.Add(new SqlParameter("@CustID", custId));
                    if (prmsExist != null)
                    {
                        Dictionary<string, object> iteratePrms = (Dictionary<string, object>)sData["paramsPrinceGrid"];


                        foreach (KeyValuePair<string, object> item in iteratePrms)
                        {
                            dbCommand.Parameters.Add(new SqlParameter(HttpUtility.HtmlDecode(item.Key.ToString()), HttpUtility.HtmlDecode(item.Value.ToString())));
                            paramsFoundSQL = paramsFoundSQL + "|" + HttpUtility.HtmlDecode(item.Key.ToString()) + " = " + HttpUtility.HtmlDecode(item.Value.ToString()) + "|";
                        }
                    }

                    SqlDataAdapter adapter = new SqlDataAdapter(dbCommand);

                    adapter.Fill(tblResults);
                }

                if (tblResults.Rows.Count > 0)
                {
                    var colsx = new List<Object>();
                    for (int i = 0; i < tblResults.Columns.Count; i++)
                    {
                        var colData = new Dictionary<string, object>();
                        colData["col_" + i] = tblResults.Columns[i].ColumnName.ToString();
                        colsx.Add(colData);
                    }
                    string ColsX = jss.Serialize(new { headder = colsx });
                    ColsX = ColsX.Substring(1);
                    ColsX = ColsX.Substring(0, ColsX.Length - 1) + ",";

                    var rowsx = new List<Object>();
                    var rowData = new Dictionary<string, object>();
                    for (int i = 0; i < tblResults.Rows.Count; i++)
                    {
                        for (int j = 0; j < tblResults.Columns.Count; j++)
                        {
                            rowData["row_" + i + "_" + j] = tblResults.Rows[i][j].ToString();
                        }
                        rowsx.Add(rowData);
                    }
                    string RowsX = jss.Serialize(new { rows = rowsx });
                    RowsX = RowsX.Substring(1);

                    System.Text.StringBuilder sb = new System.Text.StringBuilder();
                    sb.Append("{ \"responseResult\": \"Good\", \"RowCount\": \"" + tblResults.Rows.Count.ToString() + "\", \"ColCount\": \"" + tblResults.Columns.Count.ToString() + "\",");

                    sb.Append(ColsX);
                    sb.Append(RowsX);


                    //System.Text.StringBuilder sb = new System.Text.StringBuilder();

                    //sb.Append("{ \"responseResult\": \"Good\", \"RowCount\": \"" + JsonStringifier(tblResults.Rows.Count.ToString()) + "\", \"ColCount\": \"" + JsonStringifier(tblResults.Columns.Count.ToString()) + "\",");
                    //sb.Append("\"headder\": [");
                    //for (int i = 0; i < tblResults.Columns.Count; i++)
                    //{
                    //    if (i == tblResults.Columns.Count - 1)
                    //    {
                    //        sb.Append("{ \"col_" + i + "\":\"" + JsonStringifier(tblResults.Columns[i].ColumnName.ToString()) + "\" }");
                    //    }
                    //    else
                    //    {
                    //        sb.Append("{ \"col_" + i + "\":\"" + JsonStringifier(tblResults.Columns[i].ColumnName.ToString()) + "\" },");
                    //    }
                    //}
                    //sb.Append("],");

                    //sb.Append("\"rows\": [");
                    //for (int i = 0; i < tblResults.Rows.Count; i++)
                    //{
                    //    sb.Append("{ ");

                    //    for (int j = 0; j < tblResults.Columns.Count; j++)
                    //    {
                    //        if (j == tblResults.Columns.Count - 1)
                    //        {
                    //            sb.Append("\"row_" + i + "_" + j + "\":\"" + JsonStringifier(tblResults.Rows[i][j].ToString()) + "\"");
                    //        }
                    //        else
                    //        {
                    //            sb.Append("\"row_" + i + "_" + j + "\":\"" + JsonStringifier(tblResults.Rows[i][j].ToString()) + "\",");
                    //        }
                    //    }
                    //    if (i == tblResults.Rows.Count - 1)
                    //    {
                    //        sb.Append(" }");
                    //    }
                    //    else
                    //    {
                    //        sb.Append(" },");
                    //    }
                    //}
                    //sb.Append("] }");

                    writeResult = sb.ToString();
                }
                else
                {
                    writeResult = "{ \"responseResult\": \"NoData\", \"params\": \"" + paramsFoundSQL + "\" }";
                }
            }
            catch (Exception ex)
            {
                writeResult = "{ \"responseResult\": \"Failed\", \"errorCode\": \"" + ex.Message.ToString().Replace("\r", @"\\r").Replace("\n", @"\\n").Trim() + "\" }";
            }

            HttpContext.Current.Response.ContentType = "application/json";
            HttpContext.Current.Response.Write(writeResult);
        }

        public void saveChanges(string json)
        {
            string writeResult = "";
            try
            {
                var jss = new JavaScriptSerializer();
                Dictionary<string, object> sData = jss.Deserialize<Dictionary<string, object>>(json);
                object prmsExist = sData["paramsPrinceGrid"];

                string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings[sData["connection"].ToString()].ConnectionString; //System.Web.Configuration.WebConfigurationManager.ConnectionStrings["QuotingSystemDataServer"].ConnectionString;

                string paramsFoundSQL = "";
                using (SqlConnection dbConnection = new SqlConnection(connectionString))
                {
                    using (SqlCommand cmd = new SqlCommand(sData["StoredProc"].ToString(), dbConnection))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;

                        if (prmsExist != null)
                        {
                            Dictionary<string, object> iteratePrms = (Dictionary<string, object>)sData["paramsPrinceGrid"];

                            foreach (KeyValuePair<string, object> item in iteratePrms)
                            {
                                cmd.Parameters.Add(new SqlParameter(HttpUtility.HtmlDecode(item.Key.ToString()), HttpUtility.HtmlDecode(item.Value.ToString())));
                                paramsFoundSQL = paramsFoundSQL + "|" + HttpUtility.HtmlDecode(item.Key.ToString()) + " = " + HttpUtility.HtmlDecode(item.Value.ToString()) + "|";
                            }
                        }

                        dbConnection.Open();
                        cmd.ExecuteNonQuery();
                    }
                }

                writeResult = "{ \"responseResult\": \"Good\" }";
            }
            catch (Exception ex)
            {
                writeResult = "{ \"responseResult\": \"Failed\", \"errorCode\": \"" + ex.Message.ToString().Replace("\r", @"\\r").Replace("\n", @"\\n").Trim() + "\" }";
            }

            HttpContext.Current.Response.ContentType = "application/json";
            HttpContext.Current.Response.Write(writeResult);
        }

        public string JsonStringifier(string xRaw)
        {
            return xRaw.Replace(@"""", @"\""").Replace(@"\", @"\\"); //.Replace(@"'", @"\'")
        }

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}
